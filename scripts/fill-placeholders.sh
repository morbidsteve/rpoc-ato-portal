#!/usr/bin/env bash
# fill-placeholders.sh — Replace _[PLACEHOLDER]_ markers across ATO compliance documents
#
# Usage:
#   ./scripts/fill-placeholders.sh                 # Replace placeholders in-place
#   ./scripts/fill-placeholders.sh --check         # List remaining unfilled placeholders (no changes)
#   ./scripts/fill-placeholders.sh --dry-run       # Show what would be replaced (no changes)
#
# Reads configuration from compliance/raise/org-config.yaml

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$REPO_ROOT/compliance/raise/org-config.yaml"
DOCS_DIR="$REPO_ROOT/compliance/raise"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Check mode: list remaining unfilled placeholders ──────────────────────────

if [[ "${1:-}" == "--check" ]]; then
    echo -e "${CYAN}Scanning for remaining unfilled placeholders...${NC}"
    echo ""

    total=0
    found_files=()

    while IFS= read -r -d '' file; do
        count=$(grep -cE '_\[.*?\]_|\[PLACEHOLDER\]' "$file" 2>/dev/null || true)
        if [[ "$count" -gt 0 ]]; then
            found_files+=("$file")
            total=$((total + count))
            rel_path="${file#$REPO_ROOT/}"
            echo -e "${YELLOW}$rel_path${NC} — $count placeholder(s):"
            grep -nE '_\[.*?\]_|\[PLACEHOLDER\]' "$file" | head -20 | while IFS= read -r line; do
                echo "    $line"
            done
            echo ""
        fi
    done < <(find "$DOCS_DIR" -name '*.md' -print0)

    if [[ "$total" -eq 0 ]]; then
        echo -e "${GREEN}No unfilled placeholders found. All documents are ready.${NC}"
        exit 0
    else
        echo -e "${RED}Found $total placeholder(s) across ${#found_files[@]} file(s).${NC}"
        echo -e "Run ${CYAN}scripts/fill-placeholders.sh${NC} after updating ${CYAN}compliance/raise/org-config.yaml${NC}"
        exit 1
    fi
fi

# ── Parse YAML config (lightweight — no yq dependency) ────────────────────────

if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}Error: Config file not found: $CONFIG_FILE${NC}"
    echo "Create it from the template and fill in your organization details."
    exit 1
fi

# Simple YAML value extractor — handles top-level and nested keys
# Reads key: "value" or key: value patterns
yaml_get() {
    local key="$1"
    local val
    val=$(grep -E "^\s+${key}:" "$CONFIG_FILE" | head -1 | sed 's/^[^:]*:\s*//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//")
    echo "$val"
}

# Read config values
ORG_NAME=$(yaml_get "name" | head -1)
ORG_ABBREV=$(yaml_get "abbreviation" | head -1)
ORG_UNIT=$(yaml_get "unit")
SYS_NAME=$(yaml_get "name" | sed -n '2p')  # second 'name' is system name
EMASS_ID=$(yaml_get "emass_id")
DITPR_ID=$(yaml_get "ditpr_id")

# Personnel — read from the nested sections
get_person_field() {
    local section="$1"
    local field="$2"
    awk "/^  ${section}:/{found=1} found && /^\s+${field}:/{print; exit}" "$CONFIG_FILE" | sed 's/^[^:]*:\s*//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//"
}

SO_NAME=$(get_person_field "system_owner" "name")
SO_TITLE=$(get_person_field "system_owner" "title")
SO_EMAIL=$(get_person_field "system_owner" "email")
ISSM_NAME=$(get_person_field "issm" "name")
ISSM_TITLE=$(get_person_field "issm" "title")
ISSM_EMAIL=$(get_person_field "issm" "email")
ISSO_NAME=$(get_person_field "isso" "name")
AO_NAME=$(get_person_field "authorizing_official" "name")
AO_TITLE=$(get_person_field "authorizing_official" "title")
PL_NAME=$(get_person_field "platform_lead" "name")
SCA_NAME=$(get_person_field "sca" "name")
FACILITY=$(yaml_get "facility")
ATO_TARGET=$(yaml_get "ato_target")

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${CYAN}Dry run — showing replacements without modifying files.${NC}"
    echo ""
fi

# ── Build replacement map ─────────────────────────────────────────────────────

declare -A REPLACEMENTS

# Only add replacements for non-empty values
[[ -n "$ORG_NAME" ]]    && REPLACEMENTS["_[ORGANIZATION]_"]="$ORG_NAME"
[[ -n "$ORG_NAME" ]]    && REPLACEMENTS["[ORGANIZATION]"]="$ORG_NAME"
[[ -n "$ORG_ABBREV" ]]  && REPLACEMENTS["_[ORG ABBREVIATION]_"]="$ORG_ABBREV"
[[ -n "$ORG_UNIT" ]]    && REPLACEMENTS["_[UNIT]_"]="$ORG_UNIT"
[[ -n "$SO_NAME" ]]     && REPLACEMENTS["_[SYSTEM OWNER]_"]="$SO_NAME"
[[ -n "$SO_NAME" ]]     && REPLACEMENTS["_[SYSTEM OWNER NAME]_"]="$SO_NAME"
[[ -n "$SO_TITLE" ]]    && REPLACEMENTS["_[SYSTEM OWNER TITLE]_"]="$SO_TITLE"
[[ -n "$SO_EMAIL" ]]    && REPLACEMENTS["_[SYSTEM OWNER EMAIL]_"]="$SO_EMAIL"
[[ -n "$ISSM_NAME" ]]   && REPLACEMENTS["_[ISSM]_"]="$ISSM_NAME"
[[ -n "$ISSM_NAME" ]]   && REPLACEMENTS["_[ISSM NAME]_"]="$ISSM_NAME"
[[ -n "$ISSM_TITLE" ]]  && REPLACEMENTS["_[ISSM TITLE]_"]="$ISSM_TITLE"
[[ -n "$ISSM_EMAIL" ]]  && REPLACEMENTS["_[ISSM EMAIL]_"]="$ISSM_EMAIL"
[[ -n "$ISSO_NAME" ]]   && REPLACEMENTS["_[ISSO]_"]="$ISSO_NAME"
[[ -n "$ISSO_NAME" ]]   && REPLACEMENTS["_[ISSO NAME]_"]="$ISSO_NAME"
[[ -n "$AO_NAME" ]]     && REPLACEMENTS["_[AO]_"]="$AO_NAME"
[[ -n "$AO_NAME" ]]     && REPLACEMENTS["_[AO NAME]_"]="$AO_NAME"
[[ -n "$AO_NAME" ]]     && REPLACEMENTS["_[AUTHORIZING OFFICIAL]_"]="$AO_NAME"
[[ -n "$AO_TITLE" ]]    && REPLACEMENTS["_[AO TITLE]_"]="$AO_TITLE"
[[ -n "$PL_NAME" ]]     && REPLACEMENTS["_[PLATFORM LEAD]_"]="$PL_NAME"
[[ -n "$PL_NAME" ]]     && REPLACEMENTS["_[PLATFORM LEAD NAME]_"]="$PL_NAME"
[[ -n "$SCA_NAME" ]]    && REPLACEMENTS["_[SCA]_"]="$SCA_NAME"
[[ -n "$SCA_NAME" ]]    && REPLACEMENTS["_[SCA NAME]_"]="$SCA_NAME"
[[ -n "$FACILITY" ]]    && REPLACEMENTS["_[FACILITY]_"]="$FACILITY"
[[ -n "$ATO_TARGET" ]]  && REPLACEMENTS["_[ATO TARGET DATE]_"]="$ATO_TARGET"
[[ -n "$EMASS_ID" ]]    && REPLACEMENTS["_[EMASS ID]_"]="$EMASS_ID"
[[ -n "$DITPR_ID" ]]    && REPLACEMENTS["_[DITPR ID]_"]="$DITPR_ID"

# Generic [PLACEHOLDER] replacement — use org name if available, else skip
[[ -n "$SO_NAME" ]] && REPLACEMENTS["[PLACEHOLDER]"]="$SO_NAME"

if [[ ${#REPLACEMENTS[@]} -eq 0 ]]; then
    echo -e "${YELLOW}Warning: No values configured in $CONFIG_FILE${NC}"
    echo "Fill in the org-config.yaml fields before running this script."
    exit 1
fi

echo -e "${CYAN}Replacement map (${#REPLACEMENTS[@]} entries):${NC}"
for key in "${!REPLACEMENTS[@]}"; do
    echo "  $key -> ${REPLACEMENTS[$key]}"
done
echo ""

# ── Apply replacements ────────────────────────────────────────────────────────

replaced_count=0
file_count=0

while IFS= read -r -d '' file; do
    file_changed=false
    for pattern in "${!REPLACEMENTS[@]}"; do
        value="${REPLACEMENTS[$pattern]}"
        # Escape special characters for sed
        escaped_pattern=$(printf '%s\n' "$pattern" | sed 's/[[\.*^$()+?{|]/\\&/g')
        escaped_value=$(printf '%s\n' "$value" | sed 's/[&/\]/\\&/g')

        match_count=$(grep -cF "$pattern" "$file" 2>/dev/null || true)
        if [[ "$match_count" -gt 0 ]]; then
            if [[ "$DRY_RUN" == true ]]; then
                rel_path="${file#$REPO_ROOT/}"
                echo -e "  ${YELLOW}$rel_path${NC}: $pattern -> $value ($match_count occurrence(s))"
            else
                sed -i "s|${escaped_pattern}|${escaped_value}|g" "$file"
            fi
            replaced_count=$((replaced_count + match_count))
            file_changed=true
        fi
    done
    if [[ "$file_changed" == true ]]; then
        file_count=$((file_count + 1))
    fi
done < <(find "$DOCS_DIR" -name '*.md' -print0)

echo ""
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${CYAN}Dry run complete. Would replace $replaced_count placeholder(s) across $file_count file(s).${NC}"
else
    echo -e "${GREEN}Replaced $replaced_count placeholder(s) across $file_count file(s).${NC}"
fi

# Run a check for remaining placeholders
echo ""
echo -e "${CYAN}Checking for remaining unfilled placeholders...${NC}"
remaining=0
while IFS= read -r -d '' file; do
    count=$(grep -cE '_\[.*?\]_|\[PLACEHOLDER\]' "$file" 2>/dev/null || true)
    remaining=$((remaining + count))
done < <(find "$DOCS_DIR" -name '*.md' -print0)

if [[ "$remaining" -eq 0 ]]; then
    echo -e "${GREEN}All placeholders filled.${NC}"
else
    echo -e "${YELLOW}$remaining placeholder(s) remain. Run with --check for details.${NC}"
fi
