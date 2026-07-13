export interface Branch { code: string; name: string; fullName: string }

export const BRANCHES: Branch[] = [
  { code: 'CSE', name: 'Computer Science', fullName: 'Computer Science & Engineering' },
  { code: 'IT', name: 'Information Technology', fullName: 'Information Technology' },
  { code: 'ECE', name: 'Electronics & Communication', fullName: 'Electronics & Communication Engineering' },
  { code: 'EE', name: 'Electrical', fullName: 'Electrical Engineering' },
  { code: 'ME', name: 'Mechanical', fullName: 'Mechanical Engineering' },
  { code: 'CE', name: 'Civil', fullName: 'Civil Engineering' },
  { code: 'CHE', name: 'Chemical', fullName: 'Chemical Engineering' },
  { code: 'BT', name: 'Biotechnology', fullName: 'Biotechnology' },
]

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const BRANCH_NAMES: Record<string, string> = Object.fromEntries(
  BRANCHES.map((b) => [b.code, b.fullName]),
)

export function branchLabel(code: string): string {
  return BRANCH_NAMES[code] ?? code
}
