#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive test runner for Communication Matters Conference App
 * Runs both unit tests and end-to-end tests with detailed reporting
 */

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, output: '', error: '' },
      e2e: { passed: false, output: '', error: '' },
      startTime: new Date(),
      endTime: null
    };
  }

  async runCommand(command, args, description) {
    console.log(`\n🔄 ${description}...`);
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output);
      });

      process.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(output);
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code
        });
      });
    });
  }

  async runUnitTests() {
    console.log('\n📋 Starting Unit Tests...');
    const result = await this.runCommand('npm', ['run', 'test', '--', '--coverage', '--watchAll=false'], 'Running Jest unit tests');
    
    this.results.unit = {
      passed: result.success,
      output: result.stdout,
      error: result.stderr,
      exitCode: result.exitCode
    };

    if (result.success) {
      console.log('✅ Unit tests passed!');
    } else {
      console.log('❌ Unit tests failed!');
    }

    return result.success;
  }

  async runE2ETests() {
    console.log('\n🎭 Starting End-to-End Tests...');
    const result = await this.runCommand('npx', ['playwright', 'test', '--reporter=html'], 'Running Playwright E2E tests');
    
    this.results.e2e = {
      passed: result.success,
      output: result.stdout,
      error: result.stderr,
      exitCode: result.exitCode
    };

    if (result.success) {
      console.log('✅ E2E tests passed!');
    } else {
      console.log('❌ E2E tests failed!');
    }

    return result.success;
  }

  generateReport() {
    this.results.endTime = new Date();
    const duration = this.results.endTime - this.results.startTime;
    
    const report = {
      summary: {
        totalDuration: `${Math.round(duration / 1000)}s`,
        startTime: this.results.startTime.toISOString(),
        endTime: this.results.endTime.toISOString(),
        unitTestsPassed: this.results.unit.passed,
        e2eTestsPassed: this.results.e2e.passed,
        overallSuccess: this.results.unit.passed && this.results.e2e.passed
      },
      details: {
        unitTests: {
          status: this.results.unit.passed ? 'PASSED' : 'FAILED',
          exitCode: this.results.unit.exitCode,
          output: this.results.unit.output.slice(-1000), // Last 1000 chars
          error: this.results.unit.error.slice(-1000)
        },
        e2eTests: {
          status: this.results.e2e.passed ? 'PASSED' : 'FAILED',
          exitCode: this.results.e2e.exitCode,
          output: this.results.e2e.output.slice(-1000),
          error: this.results.e2e.error.slice(-1000)
        }
      }
    };

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'test-results', 'test-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${report.summary.totalDuration}`);
    console.log(`📅 Start Time: ${report.summary.startTime}`);
    console.log(`📅 End Time: ${report.summary.endTime}`);
    console.log('');
    
    console.log('📋 Unit Tests (Jest):');
    console.log(`   Status: ${this.results.unit.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Exit Code: ${this.results.unit.exitCode}`);
    console.log('');
    
    console.log('🎭 E2E Tests (Playwright):');
    console.log(`   Status: ${this.results.e2e.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Exit Code: ${this.results.e2e.exitCode}`);
    console.log('');
    
    console.log('🎯 Overall Result:');
    if (report.summary.overallSuccess) {
      console.log('   ✅ ALL TESTS PASSED!');
    } else {
      console.log('   ❌ SOME TESTS FAILED!');
      console.log('');
      console.log('📝 Next Steps:');
      if (!this.results.unit.passed) {
        console.log('   • Review unit test failures');
        console.log('   • Run: npm run test');
      }
      if (!this.results.e2e.passed) {
        console.log('   • Review E2E test failures');
        console.log('   • Run: npm run test:e2e:headed (to see browser)');
        console.log('   • Run: npm run test:e2e:report (to view HTML report)');
      }
    }
    
    console.log('');
    console.log('📁 Reports saved to:');
    console.log(`   • JSON Report: test-results/test-report.json`);
    console.log(`   • Playwright HTML: playwright-report/index.html`);
    console.log(`   • Jest Coverage: coverage/lcov-report/index.html`);
    console.log('='.repeat(60));
  }

  async run() {
    console.log('🚀 Communication Matters - Comprehensive Test Suite');
    console.log('='.repeat(60));
    
    try {
      // Run unit tests first
      const unitSuccess = await this.runUnitTests();
      
      // Run E2E tests
      const e2eSuccess = await this.runE2ETests();
      
      // Generate and display report
      const report = this.generateReport();
      this.printSummary(report);
      
      // Exit with appropriate code
      process.exit(report.summary.overallSuccess ? 0 : 1);
      
    } catch (error) {
      console.error('\n❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run();
}

module.exports = TestRunner;