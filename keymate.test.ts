import KeyMate from './keymate';

describe('KeyMate', () => {
  let keymate: KeyMate;

  beforeEach(() => {
    keymate = new KeyMate();
  });

  afterEach(() => {
    // Cleanup to prevent interference between tests
    keymate = null as unknown as KeyMate;
  });

  describe('registerShortcut', () => {
    test('triggers callback for a single key combination', () => {
      const mockCallback = jest.fn();
      keymate.registerShortcut('global', { ctrl: true, key: 's' }, mockCallback);

      const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
      document.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('does not trigger callback for incorrect key combination', () => {
      const mockCallback = jest.fn();
      keymate.registerShortcut('global', { ctrl: true, key: 's' }, mockCallback);

      const event = new KeyboardEvent('keydown', { key: 's' }); // Missing Ctrl
      document.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('overwrites existing shortcut in the same group', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      keymate.registerShortcut('global', { ctrl: true, key: 's' }, mockCallback1);
      keymate.registerShortcut('global', { ctrl: true, key: 's' }, mockCallback2);

      const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
      document.dispatchEvent(event);

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerSequence', () => {
    test('triggers callback for a valid sequence', () => {
      const mockCallback = jest.fn();
      keymate.registerSequence('global', [{ ctrl: true, key: 'k' }, { key: 's' }], mockCallback);

      const event1 = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
      const event2 = new KeyboardEvent('keydown', { key: 's' });

      document.dispatchEvent(event1);
      document.dispatchEvent(event2);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('does not trigger callback for an incomplete sequence', () => {
      const mockCallback = jest.fn();
      keymate.registerSequence('global', [{ ctrl: true, key: 'k' }, { key: 's' }], mockCallback);

      const event1 = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
      const event2 = new KeyboardEvent('keydown', { key: 'a' }); // Wrong key

      document.dispatchEvent(event1);
      document.dispatchEvent(event2);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('resets sequence after timeout', () => {
      jest.useFakeTimers();
      const mockCallback = jest.fn();

      keymate.registerSequence('global', [{ ctrl: true, key: 'k' }, { key: 's' }], mockCallback);

      const event1 = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
      document.dispatchEvent(event1);

      jest.advanceTimersByTime(1500); // Exceeds timeout

      const event2 = new KeyboardEvent('keydown', { key: 's' });
      document.dispatchEvent(event2);

      expect(mockCallback).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('unregisterShortcut', () => {
    test('removes a specific shortcut', () => {
      const mockCallback = jest.fn();
      keymate.registerShortcut('global', { ctrl: true, key: 's' }, mockCallback);
      keymate.unregisterShortcut('global', { ctrl: true, key: 's' });

      const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
      document.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('removes an entire group of shortcuts', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      keymate.registerShortcut('group1', { ctrl: true, key: 's' }, mockCallback1);
      keymate.registerShortcut('group1', { key: 'a' }, mockCallback2);

      keymate.unregisterShortcut('group1'); // Remove all shortcuts in the group

      const event1 = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
      const event2 = new KeyboardEvent('keydown', { key: 'a' });

      document.dispatchEvent(event1);
      document.dispatchEvent(event2);

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });
  });

  describe('toggleGroup', () => {
    test('disables all shortcuts in a group', () => {
      const mockCallback = jest.fn();
      keymate.registerShortcut('group1', { ctrl: true, key: 's' }, mockCallback);

      keymate.toggleGroup('group1', false); // Disable the group

      const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
      document.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('enables a previously disabled group', () => {
      const mockCallback = jest.fn();
      keymate.registerShortcut('group1', { ctrl: true, key: 's' }, mockCallback);

      keymate.toggleGroup('group1', false); // Disable the group
      keymate.toggleGroup('group1', true); // Re-enable the group

      const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
      document.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRegisteredShortcuts', () => {
    test('returns all registered shortcuts', () => {
      keymate.registerShortcut('global', { ctrl: true, key: 's' }, jest.fn());
      keymate.registerShortcut('group1', { key: 'a' }, jest.fn());

      const shortcuts = keymate.getRegisteredShortcuts();
      expect(shortcuts).toEqual(expect.arrayContaining(['ctrl+s', 'a']));
    });

    test('returns an empty array if no shortcuts are registered', () => {
      const shortcuts = keymate.getRegisteredShortcuts();
      expect(shortcuts).toEqual([]);
    });
  });
});
