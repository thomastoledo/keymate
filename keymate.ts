type KeyCombination = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
};

type ShortcutCallback = (event: KeyboardEvent) => void;

class KeyMate {
  private shortcuts: Map<string, Map<string, ShortcutCallback>> = new Map(); // Groups of shortcuts
  private activeGroups: Set<string> = new Set(); // Set of active groups
  private sequenceBuffer: string[] = []; // Buffer for detecting sequences
  private sequenceTimeout: number = 1000; // Timeout for clearing the sequence buffer
  private sequenceTimer: number | null = null; // Timer for resetting the sequence buffer

  constructor() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Registers a keyboard shortcut under a specific group (namespace).
   * @param group - The namespace or context for the shortcut.
   * @param combination - The key combination to register.
   * @param callback - The function to execute when the shortcut is triggered.
   */
  registerShortcut(group: string, combination: KeyCombination, callback: ShortcutCallback): void {
    const shortcutKey = this.getShortcutKey(combination);
    if (!this.shortcuts.has(group)) {
      this.shortcuts.set(group, new Map());
    }
    this.shortcuts.get(group)?.set(shortcutKey, callback);
    this.activeGroups.add(group);
  }

  /**
   * Registers a sequence of keyboard shortcuts.
   * @param group - The namespace for the sequence.
   * @param combination - The array of key combinations in the sequence.
   * @param callback - The function to execute when the sequence is completed.
   */
  registerSequence(group: string, combination: KeyCombination[], callback: ShortcutCallback): void {
    const sequenceKey = combination.map((key) => this.getShortcutKey(key)).join(' > ');
    if (!this.shortcuts.has(group)) {
      this.shortcuts.set(group, new Map());
    }
    this.shortcuts.get(group)?.set(sequenceKey, callback);
    this.activeGroups.add(group);
  }

  /**
   * Unregisters a shortcut or clears an entire group of shortcuts.
   * @param group - The namespace of the shortcuts.
   * @param combination - (Optional) The key combination or sequence to remove.
   */
  unregisterShortcut(group: string, combination?: KeyCombination | KeyCombination[]): void {
    if (!this.shortcuts.has(group)) return;
    if (!combination) {
      this.shortcuts.delete(group); // Clear the entire group
    } else {
      const shortcutKey = Array.isArray(combination)
        ? combination.map((key) => this.getShortcutKey(key)).join(' > ')
        : this.getShortcutKey(combination);
      this.shortcuts.get(group)?.delete(shortcutKey);
    }
  }

  /**
   * Enables or disables a group of shortcuts.
   * @param group - The namespace of the shortcuts.
   * @param enabled - Whether to enable or disable the group.
   */
  toggleGroup(group: string, enabled: boolean): void {
    if (enabled) {
      this.activeGroups.add(group);
    } else {
      this.activeGroups.delete(group);
    }
  }

  /**
   * Handles the `keydown` event, triggering shortcuts or sequences if matched.
   * @param event - The KeyboardEvent triggered by a key press.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const shortcutKey = this.getShortcutKey({
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      key: event.key.toLowerCase(),
    });

    // Check for sequence matching
    this.sequenceBuffer.push(shortcutKey);

    // Cancel existing sequence timer and restart it
    if (this.sequenceTimer) clearTimeout(this.sequenceTimer);
    this.sequenceTimer = window.setTimeout(() => {
      this.sequenceBuffer = []; // Clear buffer if sequence times out
    }, this.sequenceTimeout);

    const sequenceKey = this.sequenceBuffer.join(' > ');

    for (const [group, shortcuts] of this.shortcuts.entries()) {
      if (!this.activeGroups.has(group)) continue;

      // Trigger sequence callback
      if (shortcuts.has(sequenceKey)) {
        event.preventDefault();
        const callback = shortcuts.get(sequenceKey);
        callback?.(event);
        this.sequenceBuffer = []; // Reset buffer after a match
        return;
      }

      // Trigger single-key shortcut
      if (shortcuts.has(shortcutKey)) {
        event.preventDefault();
        const callback = shortcuts.get(shortcutKey);
        callback?.(event);
        return;
      }
    }
  }

  /**
   * Generates a unique string key for a key combination.
   * @param combination - The key combination object.
   * @returns A unique string representing the combination (e.g., "ctrl+shift+s").
   */
  private getShortcutKey(combination: KeyCombination): string {
    const parts = [];
    if (combination.ctrl) parts.push('ctrl');
    if (combination.shift) parts.push('shift');
    if (combination.alt) parts.push('alt');
    parts.push(combination.key.toLowerCase());
    return parts.join('+');
  }

  /**
   * Returns a list of all registered shortcuts across all groups.
   * @returns An array of shortcut strings.
   */
  getRegisteredShortcuts(): string[] {
    const keys: string[] = [];
    for (const shortcuts of this.shortcuts.values()) {
      keys.push(...shortcuts.keys());
    }
    return keys;
  }
}

export default KeyMate;
