import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

export const NavigationTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (name: string, status: 'pass' | 'fail', message: string) => {
    setResults(prev => [...prev, { name, status, message }]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Check if navigation updates URL
    addResult('URL Update', 'pending', 'Testing...');
    const initialPath = window.location.pathname;
    window.history.pushState({}, '', '/courses');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (window.location.pathname === '/courses') {
      addResult('URL Update', 'pass', 'URL updates correctly on navigation');
    } else {
      addResult('URL Update', 'fail', `Expected /courses, got ${window.location.pathname}`);
    }

    // Test 2: Check if back button works
    addResult('Back Button', 'pending', 'Testing...');
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.history.back();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (window.location.pathname === '/courses') {
      addResult('Back Button', 'pass', 'Back button navigation works');
    } else {
      addResult('Back Button', 'fail', `Expected /courses after back, got ${window.location.pathname}`);
    }

    // Test 3: Check if forward button works
    addResult('Forward Button', 'pending', 'Testing...');
    window.history.forward();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (window.location.pathname === '/dashboard') {
      addResult('Forward Button', 'pass', 'Forward button navigation works');
    } else {
      addResult('Forward Button', 'fail', `Expected /dashboard after forward, got ${window.location.pathname}`);
    }

    // Test 4: Check if sidebar active state updates
    addResult('Sidebar Active State', 'pending', 'Testing...');
    const sidebarLinks = document.querySelectorAll('nav a');
    let foundActiveLink = false;
    
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = link.classList.contains('bg-green-50') || link.classList.contains('text-green-600');
      if (href === window.location.pathname && isActive) {
        foundActiveLink = true;
      }
    });
    
    if (foundActiveLink) {
      addResult('Sidebar Active State', 'pass', 'Sidebar highlights active page correctly');
    } else {
      addResult('Sidebar Active State', 'fail', 'Sidebar does not highlight active page');
    }

    // Test 5: Check for console errors
    addResult('Console Errors', 'pending', 'Testing...');
    const originalError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      originalError(...args);
    };
    
    // Navigate through several pages
    const testPages = ['/courses', '/assignments/teacher', '/students', '/analytics', '/dashboard'];
    for (const page of testPages) {
      window.history.pushState({}, '', page);
      window.dispatchEvent(new PopStateEvent('popstate'));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error = originalError;
    
    if (errorCount === 0) {
      addResult('Console Errors', 'pass', 'No console errors during navigation');
    } else {
      addResult('Console Errors', 'fail', `${errorCount} console errors detected`);
    }

    // Restore initial path
    window.history.pushState({}, '', initialPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Navigation State Persistence Test</h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={testing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'pass'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'fail'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-600">
                  Passed: {results.filter(r => r.status === 'pass').length} / {results.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
