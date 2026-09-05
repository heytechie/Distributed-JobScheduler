import {TestJobHandler} from './test-job.handler.js';


export const jobHandlerRegistry = {
    TEST_JOB : new TestJobHandler(),
}