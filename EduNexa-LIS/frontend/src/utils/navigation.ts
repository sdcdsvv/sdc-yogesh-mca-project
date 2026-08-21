/**
 * Navigation utility functions for the EduNexa LMS
 */

export const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const navigateBack = () => {
  window.history.back();
};

export const navigateForward = () => {
  window.history.forward();
};

export const getCurrentPath = () => {
  return window.location.pathname;
};

export const isCurrentPath = (path: string) => {
  return window.location.pathname === path;
};