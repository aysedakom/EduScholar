import os

filepath = r"c:\Users\piama\EduScholar Revise\frontend\src\pages\student\SchoolAidDistributionPage.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_delete_zone = False

# We want to delete starting after the closing ]; of PARTNER_SCHOOLS_LIST,
# which corresponds to the first ]; we see after PARTNER_SCHOOLS_LIST definition.
# Wait, let's just find "const INITIAL_STUDENT_AID_RECORDS" or the residual lines.
# A simpler way is to filter out lines between the end of PARTNER_SCHOOLS_LIST and export const INITIAL_STUDENT_AID_RECORDS.

partner_schools_end_idx = -1
for idx, line in enumerate(lines):
    if "totalAidAllocated: 3200000" in line:
        # The closing ]; is within the next few lines
        for j in range(idx, idx + 5):
            if "];" in lines[j]:
                partner_schools_end_idx = j
                break
        break

if partner_schools_end_idx != -1:
    print(f"Found end of PARTNER_SCHOOLS_LIST at line {partner_schools_end_idx + 1}")
    # Now let's find the start of SchoolAidDistributionPage
    component_start_idx = -1
    for idx in range(partner_schools_end_idx, len(lines)):
        if "export const SchoolAidDistributionPage" in lines[idx]:
            component_start_idx = idx
            break
            
    if component_start_idx != -1:
        print(f"Found start of SchoolAidDistributionPage at line {component_start_idx + 1}")
        # Keep lines up to partner_schools_end_idx + 1
        new_lines.extend(lines[:partner_schools_end_idx + 1])
        # Add spacing and the empty array definition
        new_lines.append("\n\nexport const INITIAL_STUDENT_AID_RECORDS: StudentAidRecord[] = [];\n\n")
        # Keep lines from component_start_idx onwards
        new_lines.extend(lines[component_start_idx:])
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Successfully cleaned up SchoolAidDistributionPage.tsx!")
    else:
        print("Error: Could not find SchoolAidDistributionPage definition")
else:
    print("Error: Could not find end of PARTNER_SCHOOLS_LIST")
