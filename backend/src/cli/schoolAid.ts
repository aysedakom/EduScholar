import { Command } from 'commander';
import { StudentRegistry } from '../modules/studentRegistry';
import { AidManager } from '../modules/aidManager';
import { NotificationSystem } from '../modules/notificationSystem';

const program = new Command();
const registry = new StudentRegistry();
const aidManager = new AidManager();
const notifier = new NotificationSystem();

program
  .name('School Aid CLI')
  .description('Manage School Aid Distribution')
  .version('1.0.0');

// Command: Populate Eligible Students
program
  .command('populate-eligibles')
  .description('Populate eligible students from the student registry')
  .requiredOption('-p, --program <name>', 'Aid program name')
  .action(async (options) => {
    const eligibles = await registry.getEligibleStudents(options.program);
    await aidManager.addEligibleStudents(options.program, eligibles);
    console.log(`Populated ${eligibles.length} eligible students for program "${options.program}".`);
  });

// Command: Allocate Funds
program
  .command('allocate-funds')
  .description('Allocate funds to eligible students')
  .requiredOption('-p, --program <name>', 'Aid program name')
  .requiredOption('-b, --budget <number>', 'Total budget available', parseFloat)
  .action(async (options) => {
    const allocations = await aidManager.allocateFunds(options.program, options.budget);
    console.log(`Allocated funds to ${allocations.length} students under "${options.program}".`);
  });

// Command: Distribute Aid
program
  .command('distribute')
  .description('Distribute aid to eligible students and notify them')
  .requiredOption('-p, --program <name>', 'Aid program name')
  .action(async (options) => {
    const distributed = await aidManager.distributeAid(options.program);
    await notifier.sendNotifications(options.program, distributed);
    console.log(`Distributed aid to ${distributed.length} students and notifications sent.`);
  });

// Command: Generate Report
program
  .command('report')
  .description('Generate distribution report')
  .requiredOption('-p, --program <name>', 'Aid program name')
  .action(async (options) => {
    const report = await aidManager.generateReport(options.program);
    console.table(report);
    console.log(`Report generated for "${options.program}".`);
  });

// Parse CLI arguments
program.parse(process.argv);
