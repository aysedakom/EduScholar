export class AidManager {
  private eligibles: any[] = [];
  private allocations: any[] = [];
  private distributed: any[] = [];

  async addEligibleStudents(program: string, students: any[]) {
    console.log(`[AidManager] Adding ${students.length} eligible students to program: ${program}`);
    this.eligibles = students;
  }

  async allocateFunds(program: string, budget: number) {
    console.log(`[AidManager] Allocating $${budget} across eligible students for program: ${program}`);
    // Dummy allocation
    this.allocations = this.eligibles.map(student => ({
      studentId: student.id,
      name: student.name,
      amount: budget / (this.eligibles.length || 1)
    }));
    return this.allocations;
  }

  async distributeAid(program: string) {
    console.log(`[AidManager] Distributing aid for program: ${program}`);
    this.distributed = this.allocations;
    return this.distributed;
  }

  async generateReport(program: string) {
    console.log(`[AidManager] Generating report for program: ${program}`);
    return this.distributed.length > 0 ? this.distributed : [
      { studentId: '1', name: 'Alice Smith', amount: 25000 },
      { studentId: '2', name: 'Bob Jones', amount: 25000 }
    ];
  }
}
