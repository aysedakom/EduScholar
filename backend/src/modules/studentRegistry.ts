export class StudentRegistry {
  async getEligibleStudents(program: string) {
    console.log(`[StudentRegistry] Fetching eligible students for program: ${program}`);
    return [
      { id: '1', name: 'Alice Smith', gpa: 3.8 },
      { id: '2', name: 'Bob Jones', gpa: 3.5 }
    ];
  }
}
