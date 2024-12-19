### **README for KeyMate**

---

# **KeyMate**

**KeyMate** is a lightweight and powerful library for managing keyboard shortcuts in web applications. It supports:
- Simple shortcuts (`Ctrl + S`, `Shift + A`).
- Key sequences (`Ctrl + K`, followed by `S`).
- Group-based management (namespaces) to enable or disable sets of shortcuts dynamically.

---

## **Features**

- 📜 **Simple Shortcuts**: Configure combinations like `Ctrl + S` or `Shift + Alt + R`.
- 🔗 **Key Sequences**: Detect successive combinations like `Ctrl + K > S`.
- 🏷 **Group Management**: Dynamically enable or disable groups of shortcuts.
- ⚡️ **Optimized**: Centralized event management for maximum performance.

---

## **Installation**

Install KeyMate using **npm** or **yarn**:

```bash
npm install keymate
```

---

## **Usage**

### **1. Create an instance**
```typescript
import KeyMate from 'keymate';

const keymate = new KeyMate();
```

### **2. Register a simple shortcut**
```typescript
keymate.registerShortcut('global', { ctrl: true, key: 's' }, (event) => {
  console.log('Save triggered!');
});
```

### **3. Register a sequence**
```typescript
keymate.registerSequence('global', [
  { ctrl: true, key: 'k' },
  { key: 's' }
], (event) => {
  console.log('Sequence Ctrl + K > S triggered!');
});
```

### **4. Disable/Enable a group**
```typescript
keymate.toggleGroup('global', false); // Disable all shortcuts in the "global" group
keymate.toggleGroup('global', true);  // Re-enable the "global" group
```

### **5. Remove shortcuts**
- Remove a specific shortcut:
```typescript
keymate.unregisterShortcut('global', { ctrl: true, key: 's' });
```

- Remove all shortcuts in a group:
```typescript
keymate.unregisterShortcut('global');
```

---

## **API**

### **`registerShortcut(group, combination, callback)`**
- **group**: The namespace or context for the shortcut.
- **combination**: An object describing the key combination (`{ ctrl: boolean, shift: boolean, alt: boolean, key: string }`).
- **callback**: Function to execute when the shortcut is triggered.

### **`registerSequence(group, combination[], callback)`**
- **group**: The namespace for the sequence.
- **combination[]**: An array of objects describing a sequence of key combinations.
- **callback**: Function to execute when the sequence is completed.

### **`unregisterShortcut(group, combination?)`**
- **group**: The namespace of the shortcuts.
- **combination** *(optional)*: The specific combination or sequence to remove. If not provided, all shortcuts in the group will be removed.

### **`toggleGroup(group, enabled)`**
- **group**: The namespace of the shortcuts.
- **enabled**: A boolean to enable or disable the group.

### **`getRegisteredShortcuts()`**
- Returns an array containing all registered shortcuts across all groups.

---

## **Advanced Examples**

### **Using complex sequences**
```typescript
keymate.registerSequence('editor', [
  { key: 'g' },
  { key: 'o' },
  { key: 't' }
], () => {
  console.log('Sequence "G > O > T" triggered!');
});
```

### **Restricting shortcuts to specific contexts**
For example, activating shortcuts only within a modal:

```typescript
const modalActive = true;

keymate.registerShortcut('modal', { key: 'Escape' }, () => {
  if (modalActive) {
    console.log('Modal closed!');
  }
});

keymate.toggleGroup('modal', modalActive);
```

---

## **Roadmap**

### **Ideas for Future Features**
1. **Advanced Sequence Management**:
   - Add pause/resume functionality for sequences using [TimePulse](https://github.com/thomastoledo/timepulse) to manage delays precisely.

2. **Dynamic Contextual Shortcuts**:
   - Enable/disable shortcuts dynamically based on specific elements in the DOM.

3. **Inspection API**:
   - Add a method to list and debug all active shortcuts with their group and context.

4. **Conflict Management**:
   - Automatically detect and resolve shortcut conflicts within the same group.

5. **Mobile Support**:
   - Add support for gestures or keyboard shortcuts specific to mobile keyboards.

---

## **Contributing**

Contributions are welcome! If you have ideas or encounter issues, feel free to submit an **issue** or a **pull request**.

---

## **License**

KeyMate is licensed under the MIT License. 🗝️