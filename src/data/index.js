// Data module exports
import { mockSessions } from './mockSessions';

console.log('🔧 Debug - index.js loaded, mockSessions length:', mockSessions?.length || 'undefined');

export { mockSessions };
export default mockSessions;