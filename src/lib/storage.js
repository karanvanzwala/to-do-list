// Safe storage utility that works in both browser and server environments
class SafeStorage {
  constructor() {
    this.isBrowser = typeof window !== 'undefined';
  }

  getItem(key) {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  }

  setItem(key, value) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
    }
  }

  removeItem(key) {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
    }
  }

  clear() {
    if (!this.isBrowser) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage.clear failed:', error);
    }
  }
}

export default new SafeStorage();
