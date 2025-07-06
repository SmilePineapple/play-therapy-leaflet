// Data module exports
import mockSessionsData from './mockSessions.js';

console.log('🔧 Debug - index.js loaded, mockSessions length:', mockSessionsData?.length || 'undefined');

export { mockSessionsData as mockSessions };
export default mockSessionsData;