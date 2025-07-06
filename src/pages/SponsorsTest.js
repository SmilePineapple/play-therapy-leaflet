import React, { useEffect } from 'react';

const SponsorsTest = () => {
  useEffect(() => {
    // Cleanup function
    return () => {};
  }, []);

  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1>TEST SPONSORS COMPONENT</h1>
      <p>This is a test component to verify routing works.</p>
      <div style={{ padding: '10px', background: 'yellow', margin: '10px 0' }}>
        Debug: Test component is working!
      </div>
    </div>
  );
};

export default SponsorsTest;
