/**
 * Stack using Array - DSA Visual Educator
 * Core Simulation Engine
 */

// Application State Model
const state = {
    stackArray: [],
    topIndex: -1,
    maxCapacity: 6,
    
    // Simulation / Debugger variables
    activeOp: null,         // 'push', 'pop', 'peek', 'traverse', 'isempty', 'isfull', 'display'
    steps: [],              // Array of Step objects
    currentStepIndex: -1,   // -1 means operation loaded but not started
    logs: [],               // Array of log objects: { text, type }
    
    // Auxiliary state for traversal pointer tracking
    auxIndex: -1,
    showAux: false
};

// Static Classroom-friendly Pseudocode Dataset
const PSEUDOCODE_DATA = {
    push: [
        "START",
        "IF top == SIZE - 1",
        "    PRINT \"Stack Overflow\"",
        "ELSE",
        "    top = top + 1",
        "    stack[top] = value",
        "END IF",
        "STOP"
    ],
    pop: [
        "START",
        "IF top == -1",
        "    PRINT \"Stack Underflow\"",
        "ELSE",
        "    value = stack[top]",
        "    top = top - 1",
        "    PRINT \"Popped value\"",
        "END IF",
        "STOP"
    ],
    peek: [
        "START",
        "IF top == -1",
        "    PRINT \"Stack is empty\"",
        "ELSE",
        "    PRINT stack[top]",
        "END IF",
        "STOP"
    ],
    traverse: [
        "START",
        "IF top == -1",
        "    PRINT \"Stack is empty\"",
        "ELSE",
        "    i = top",
        "    WHILE i >= 0",
        "        PRINT stack[i]",
        "        i = i - 1",
        "    END WHILE",
        "END IF",
        "STOP"
    ],
    isempty: [
        "START",
        "IF top == -1",
        "    PRINT \"Stack is empty (True)\"",
        "ELSE",
        "    PRINT \"Stack is not empty (False)\"",
        "END IF",
        "STOP"
    ],
    isfull: [
        "START",
        "IF top == SIZE - 1",
        "    PRINT \"Stack is full (True)\"",
        "ELSE",
        "    PRINT \"Stack is not full (False)\"",
        "END IF",
        "STOP"
    ],
    display: [
        "START",
        "IF top == -1",
        "    PRINT \"Stack is empty\"",
        "ELSE",
        "    i = 0",
        "    WHILE i <= top",
        "        PRINT stack[i]",
        "        i = i + 1",
        "    END WHILE",
        "END IF",
        "STOP"
    ]
};

// Dynamic Step Generators for each operation
function makePushSteps(val) {
    const steps = [];
    const isFull = state.topIndex === state.maxCapacity - 1;
    
    // Step 1: Check if full (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check if stack has empty space by comparing top pointer to the maximum boundary.",
        execute: () => {
            const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
            if (lastCell) {
                lastCell.classList.add(isFull ? "active-boundary" : "active-boundary-ok");
            }
        },
        undo: () => {
            const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
            if (lastCell) {
                lastCell.classList.remove("active-boundary", "active-boundary-ok");
            }
        }
    });
    
    if (isFull) {
        // Step 2: Print error (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Stack is already full! Display a 'Stack Overflow' alert.",
            execute: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.remove("active-boundary");
                
                const container = document.getElementById("array-container");
                container.style.animation = "pulse-glow-rose 0.5s ease 2";
                addLog(`Error: Stack Overflow! (Cannot insert '${val}')`, "error");
            },
            undo: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.add("active-boundary");
                
                const container = document.getElementById("array-container");
                container.style.animation = "";
                removeLastLog();
            }
        });
        
        // Step 3: STOP (Line 8)
        steps.push({
            lineIndex: 8,
            explanation: "Push operation terminates. No elements were added.",
            execute: () => {},
            undo: () => {}
        });
    } else {
        // Step 2: ELSE branch (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "The stack is not full, so enter the ELSE branch to push the value.",
            execute: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.remove("active-boundary-ok");
            },
            undo: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.add("active-boundary-ok");
            }
        });
        
        // Step 3: top = top + 1 (Line 5)
        const oldTop = state.topIndex;
        const newTop = oldTop + 1;
        steps.push({
            lineIndex: 5,
            explanation: "Increment the top pointer to point to the next empty array cell.",
            execute: () => {
                state.topIndex = newTop;
                alignPointer("top-pointer", newTop, true);
            },
            undo: () => {
                state.topIndex = oldTop;
                alignPointer("top-pointer", oldTop, true);
            }
        });
        
        // Step 4: stack[top] = value (Line 6)
        steps.push({
            lineIndex: 6,
            explanation: `Insert the value '${val}' into the array slot at index ${newTop}.`,
            execute: () => {
                state.stackArray[newTop] = val;
                const cell = document.querySelector(`.array-cell[data-index="${newTop}"]`);
                if (cell) {
                    cell.classList.add("filled", "active-push");
                    cell.querySelector(".cell-val").textContent = val;
                }
                
                // Update badges
                const badgeEmpty = document.getElementById("badge-empty");
                const badgeFull = document.getElementById("badge-full");
                badgeEmpty.classList.add("hidden");
                if (newTop === state.maxCapacity - 1) {
                    badgeFull.classList.remove("hidden");
                }
                
                addLog(`Pushed value '${val}' onto the stack at index ${newTop}.`, "success");
            },
            undo: () => {
                state.stackArray[newTop] = null;
                const cell = document.querySelector(`.array-cell[data-index="${newTop}"]`);
                if (cell) {
                    cell.classList.remove("filled", "active-push");
                    cell.querySelector(".cell-val").textContent = "";
                }
                
                // Restore badges
                const badgeEmpty = document.getElementById("badge-empty");
                const badgeFull = document.getElementById("badge-full");
                if (oldTop === -1) {
                    badgeEmpty.classList.remove("hidden");
                }
                badgeFull.classList.add("hidden");
                
                removeLastLog();
            }
        });
        
        // Step 5: STOP (Line 8)
        steps.push({
            lineIndex: 8,
            explanation: "Push operation terminates. The value is now saved in the stack.",
            execute: () => {
                const cell = document.querySelector(`.array-cell[data-index="${newTop}"]`);
                if (cell) cell.classList.remove("active-push");
            },
            undo: () => {
                const cell = document.querySelector(`.array-cell[data-index="${newTop}"]`);
                if (cell) cell.classList.add("active-push");
            }
        });
    }
    
    return steps;
}

function makePopSteps() {
    const steps = [];
    const isEmpty = state.topIndex === -1;
    
    // Step 1: IF top == -1 (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check whether the stack is empty by comparing top pointer to -1.",
        execute: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer && isEmpty) {
                pointer.style.animation = "pulse-glow-rose 1.5s infinite";
            }
        },
        undo: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer) pointer.style.animation = "";
        }
    });
    
    if (isEmpty) {
        // Step 2: PRINT "Stack Underflow" (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Stack is empty! Display a 'Stack Underflow' alert.",
            execute: () => {
                addLog("Error: Stack Underflow! (Cannot pop from empty stack)", "error");
            },
            undo: () => {
                removeLastLog();
            }
        });
        
        // Step 3: STOP (Line 9)
        steps.push({
            lineIndex: 9,
            explanation: "Pop operation terminates. No elements were popped.",
            execute: () => {},
            undo: () => {}
        });
    } else {
        const oldTop = state.topIndex;
        const newTop = oldTop - 1;
        const poppedVal = state.stackArray[oldTop];
        
        // Step 2: ELSE (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "Stack contains elements. Enter the ELSE branch to perform the pop.",
            execute: () => {},
            undo: () => {}
        });
        
        // Step 3: value = stack[top] (Line 5)
        steps.push({
            lineIndex: 5,
            explanation: `Retrieve the value '${poppedVal}' currently positioned at the top index ${oldTop}.`,
            execute: () => {
                const cell = document.querySelector(`.array-cell[data-index="${oldTop}"]`);
                if (cell) cell.classList.add("active-pop");
                addLog(`Reading top element: '${poppedVal}'`, "info");
            },
            undo: () => {
                const cell = document.querySelector(`.array-cell[data-index="${oldTop}"]`);
                if (cell) cell.classList.remove("active-pop");
                removeLastLog();
            }
        });
        
        // Step 4: top = top - 1 (Line 6)
        steps.push({
            lineIndex: 6,
            explanation: `Decrement the top pointer to point to the previous element index (${newTop}).`,
            execute: () => {
                state.topIndex = newTop;
                alignPointer("top-pointer", newTop, true);
            },
            undo: () => {
                state.topIndex = oldTop;
                alignPointer("top-pointer", oldTop, true);
            }
        });
        
        // Step 5: PRINT "Popped value" (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: `Remove the value '${poppedVal}' from the array cell and output it to the console.`,
            execute: () => {
                state.stackArray[oldTop] = null;
                const cell = document.querySelector(`.array-cell[data-index="${oldTop}"]`);
                if (cell) {
                    cell.classList.remove("filled", "active-pop");
                    cell.querySelector(".cell-val").textContent = "";
                }
                
                // Update badges
                const badgeEmpty = document.getElementById("badge-empty");
                const badgeFull = document.getElementById("badge-full");
                if (newTop === -1) {
                    badgeEmpty.classList.remove("hidden");
                }
                badgeFull.classList.add("hidden");
                
                addLog(`Popped value '${poppedVal}' from stack.`, "warn");
            },
            undo: () => {
                state.stackArray[oldTop] = poppedVal;
                const cell = document.querySelector(`.array-cell[data-index="${oldTop}"]`);
                if (cell) {
                    cell.classList.add("filled", "active-pop");
                    cell.querySelector(".cell-val").textContent = poppedVal;
                }
                
                // Restore badges
                const badgeEmpty = document.getElementById("badge-empty");
                const badgeFull = document.getElementById("badge-full");
                badgeEmpty.classList.add("hidden");
                if (oldTop === state.maxCapacity - 1) {
                    badgeFull.classList.remove("hidden");
                }
                
                removeLastLog();
            }
        });
        
        // Step 6: STOP (Line 9)
        steps.push({
            lineIndex: 9,
            explanation: "Pop operation completes successfully.",
            execute: () => {},
            undo: () => {}
        });
    }
    
    return steps;
}

function makePeekSteps() {
    const steps = [];
    const isEmpty = state.topIndex === -1;
    
    // Step 1: Check empty (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check whether the stack is empty before inspecting top.",
        execute: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer && isEmpty) {
                pointer.style.animation = "pulse-glow-rose 1.5s infinite";
            }
        },
        undo: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer) pointer.style.animation = "";
        }
    });
    
    if (isEmpty) {
        // Step 2: PRINT (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Stack is empty! Cannot peek at any element.",
            execute: () => {
                addLog("Error: Stack is empty (cannot peek)", "error");
            },
            undo: () => {
                removeLastLog();
            }
        });
        // Step 3: STOP (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: "Peek operation terminates.",
            execute: () => {},
            undo: () => {}
        });
    } else {
        const topVal = state.stackArray[state.topIndex];
        const topPos = state.topIndex;
        
        // Step 2: ELSE (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "Stack contains elements. Enter the ELSE branch to read the top value.",
            execute: () => {},
            undo: () => {}
        });
        
        // Step 3: PRINT stack[top] (Line 5)
        steps.push({
            lineIndex: 5,
            explanation: `Read the top element (value: '${topVal}') at index ${topPos}. Stack structure is unchanged.`,
            execute: () => {
                const cell = document.querySelector(`.array-cell[data-index="${topPos}"]`);
                if (cell) cell.classList.add("active-peek");
                addLog(`Peeked value: '${topVal}' at top index ${topPos}.`, "info");
            },
            undo: () => {
                const cell = document.querySelector(`.array-cell[data-index="${topPos}"]`);
                if (cell) cell.classList.remove("active-peek");
                removeLastLog();
            }
        });
        
        // Step 4: STOP (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: "Peek operation completes successfully.",
            execute: () => {
                const cell = document.querySelector(`.array-cell[data-index="${topPos}"]`);
                if (cell) cell.classList.remove("active-peek");
            },
            undo: () => {
                const cell = document.querySelector(`.array-cell[data-index="${topPos}"]`);
                if (cell) cell.classList.add("active-peek");
            }
        });
    }
    
    return steps;
}

function makeTraverseSteps() {
    const steps = [];
    const isEmpty = state.topIndex === -1;
    
    // Step 1: Check empty (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check whether the stack is empty (top == -1).",
        execute: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer && isEmpty) {
                pointer.style.animation = "pulse-glow-rose 1.5s infinite";
            }
        },
        undo: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer) pointer.style.animation = "";
        }
    });
    
    if (isEmpty) {
        // Step 2: PRINT (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Stack is empty! There are no elements to traverse.",
            execute: () => {
                addLog("Error: Stack is empty (cannot traverse)", "error");
            },
            undo: () => {
                removeLastLog();
            }
        });
        // Step 3: STOP (Line 12)
        steps.push({
            lineIndex: 12,
            explanation: "Traversal terminates.",
            execute: () => {},
            undo: () => {}
        });
    } else {
        const startTop = state.topIndex;
        
        // Step 2: ELSE (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "Stack has elements. Enter the ELSE block to initiate traversal.",
            execute: () => {},
            undo: () => {}
        });
        
        // Step 3: i = top (Line 5)
        steps.push({
            lineIndex: 5,
            explanation: `Initialize loop pointer i to current top index (${startTop}).`,
            execute: () => {
                state.auxIndex = startTop;
                state.showAux = true;
                alignPointer("aux-pointer", startTop, true);
                addLog(`Traversing stack elements from top (index ${startTop}) down to 0:`, "info");
            },
            undo: () => {
                state.auxIndex = -1;
                state.showAux = false;
                alignPointer("aux-pointer", -1, false);
                removeLastLog();
            }
        });
        
        // Loop execution paths
        for (let k = startTop; k >= 0; k--) {
            // Line 6: WHILE i >= 0
            steps.push({
                lineIndex: 6,
                explanation: `Check if i (${k}) is greater than or equal to 0. (Condition is True).`,
                execute: () => {
                    state.auxIndex = k;
                    alignPointer("aux-pointer", k, true);
                },
                undo: () => {
                    state.auxIndex = k;
                    alignPointer("aux-pointer", k, true);
                }
            });
            
            // Line 7: PRINT stack[i]
            const val = state.stackArray[k];
            steps.push({
                lineIndex: 7,
                explanation: `Print value at index ${k}: '${val}'.`,
                execute: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.add("active-traverse");
                    addLog(`  stack[${k}] = '${val}'`, "system");
                },
                undo: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.remove("active-traverse");
                    removeLastLog();
                }
            });
            
            // Line 8: i = i - 1
            steps.push({
                lineIndex: 8,
                explanation: `Decrement i to point to the next lower index (${k - 1}).`,
                execute: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.remove("active-traverse");
                    
                    state.auxIndex = k - 1;
                    if (k - 1 >= 0) {
                        alignPointer("aux-pointer", k - 1, true);
                    } else {
                        alignPointer("aux-pointer", -1, false);
                    }
                },
                undo: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.add("active-traverse");
                    
                    state.auxIndex = k;
                    alignPointer("aux-pointer", k, true);
                }
            });
        }
        
        // Line 6 check when false
        steps.push({
            lineIndex: 6,
            explanation: "Check condition: i is now -1, which is less than 0. (Condition is False). Exit the loop.",
            execute: () => {
                state.showAux = false;
                alignPointer("aux-pointer", -1, false);
            },
            undo: () => {
                state.showAux = true;
                state.auxIndex = 0;
                alignPointer("aux-pointer", 0, true);
            }
        });
        
        // Line 12: STOP
        steps.push({
            lineIndex: 12,
            explanation: "Stack traversal completes successfully.",
            execute: () => {
                addLog("Traversal complete.", "success");
            },
            undo: () => {
                removeLastLog();
            }
        });
    }
    
    return steps;
}

function makeIsEmptySteps() {
    const steps = [];
    const isEmpty = state.topIndex === -1;
    
    // Step 1: Check empty (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check if top pointer is at -1.",
        execute: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer && isEmpty) {
                pointer.style.animation = "pulse-glow-cyan 1.5s infinite";
            }
        },
        undo: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer) pointer.style.animation = "";
        }
    });
    
    if (isEmpty) {
        // Step 2: PRINT true (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Condition is true (top == -1). The stack is empty. Print True.",
            execute: () => {
                addLog("isEmpty() returned: True", "success");
            },
            undo: () => {
                removeLastLog();
            }
        });
        // Step 3: STOP (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: "isEmpty check terminates.",
            execute: () => {},
            undo: () => {}
        });
    } else {
        // Step 2: ELSE (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "Condition is false (top != -1). Enter the ELSE branch.",
            execute: () => {},
            undo: () => {}
        });
        // Step 3: PRINT false (Line 5)
        steps.push({
            lineIndex: 5,
            explanation: `The stack contains ${state.topIndex + 1} element(s). It is not empty. Print False.`,
            execute: () => {
                addLog("isEmpty() returned: False", "info");
            },
            undo: () => {
                removeLastLog();
            }
        });
        // Step 4: STOP (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: "isEmpty check terminates.",
            execute: () => {},
            undo: () => {}
        });
    }
    return steps;
}

function makeIsFullSteps() {
    const steps = [];
    const isFull = state.topIndex === state.maxCapacity - 1;
    
    // Step 1: Check full (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check whether top index is equal to capacity - 1.",
        execute: () => {
            const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
            if (lastCell) {
                lastCell.classList.add("active-boundary");
            }
        },
        undo: () => {
            const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
            if (lastCell) {
                lastCell.classList.remove("active-boundary");
            }
        }
    });
    
    if (isFull) {
        // Step 2: PRINT true (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Condition is true (top == SIZE - 1). The stack is full. Print True.",
            execute: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) {
                    lastCell.classList.remove("active-boundary");
                    lastCell.classList.add("active-boundary-ok");
                }
                addLog("isFull() returned: True", "success");
            },
            undo: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) {
                    lastCell.classList.add("active-boundary");
                    lastCell.classList.remove("active-boundary-ok");
                }
                removeLastLog();
            }
        });
        // Step 3: STOP (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: "isFull check terminates.",
            execute: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.remove("active-boundary-ok");
            },
            undo: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.add("active-boundary-ok");
            }
        });
    } else {
        // Step 2: ELSE (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "Condition is false (top != SIZE - 1). Enter the ELSE branch.",
            execute: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.remove("active-boundary");
            },
            undo: () => {
                const lastCell = document.querySelector(`.array-cell[data-index="${state.maxCapacity - 1}"]`);
                if (lastCell) lastCell.classList.add("active-boundary");
            }
        });
        // Step 3: PRINT false (Line 5)
        steps.push({
            lineIndex: 5,
            explanation: `Top is at ${state.topIndex}, which is less than maximum index (${state.maxCapacity - 1}). The stack is not full. Print False.`,
            execute: () => {
                addLog("isFull() returned: False", "info");
            },
            undo: () => {
                removeLastLog();
            }
        });
        // Step 4: STOP (Line 7)
        steps.push({
            lineIndex: 7,
            explanation: "isFull check terminates.",
            execute: () => {},
            undo: () => {}
        });
    }
    return steps;
}

function makeDisplaySteps() {
    const steps = [];
    const isEmpty = state.topIndex === -1;
    
    // Step 1: Check empty (Line 2)
    steps.push({
        lineIndex: 2,
        explanation: "Check whether the stack is empty before display.",
        execute: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer && isEmpty) {
                pointer.style.animation = "pulse-glow-rose 1.5s infinite";
            }
        },
        undo: () => {
            const pointer = document.getElementById("top-pointer");
            if (pointer) pointer.style.animation = "";
        }
    });
    
    if (isEmpty) {
        // Step 2: PRINT empty (Line 3)
        steps.push({
            lineIndex: 3,
            explanation: "Stack is empty! Cannot display any elements.",
            execute: () => {
                addLog("Error: Stack is empty (cannot display)", "error");
            },
            undo: () => {
                removeLastLog();
            }
        });
        // Step 3: STOP (Line 11)
        steps.push({
            lineIndex: 11,
            explanation: "Display terminates.",
            execute: () => {},
            undo: () => {}
        });
    } else {
        const topLimit = state.topIndex;
        
        // Step 2: ELSE (Line 4)
        steps.push({
            lineIndex: 4,
            explanation: "Stack contains elements. Enter the ELSE block to initiate display.",
            execute: () => {},
            undo: () => {}
        });
        
        // Step 3: i = 0 (Line 5)
        steps.push({
            lineIndex: 5,
            explanation: "Initialize loop pointer i to 0 (the bottom index of the stack).",
            execute: () => {
                state.auxIndex = 0;
                state.showAux = true;
                alignPointer("aux-pointer", 0, true);
                addLog("Displaying stack elements from bottom (index 0) up to top:", "info");
            },
            undo: () => {
                state.auxIndex = -1;
                state.showAux = false;
                alignPointer("aux-pointer", -1, false);
                removeLastLog();
            }
        });
        
        // Loop
        for (let k = 0; k <= topLimit; k++) {
            // Line 6: WHILE i <= top
            steps.push({
                lineIndex: 6,
                explanation: `Check if i (${k}) is less than or equal to top (${topLimit}). (Condition is True).`,
                execute: () => {
                    state.auxIndex = k;
                    alignPointer("aux-pointer", k, true);
                },
                undo: () => {
                    state.auxIndex = k;
                    alignPointer("aux-pointer", k, true);
                }
            });
            
            // Line 7: PRINT stack[i]
            const val = state.stackArray[k];
            steps.push({
                lineIndex: 7,
                explanation: `Print value at index ${k}: '${val}'.`,
                execute: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.add("active-traverse");
                    addLog(`  stack[${k}] = '${val}'`, "system");
                },
                undo: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.remove("active-traverse");
                    removeLastLog();
                }
            });
            
            // Line 8: i = i + 1
            steps.push({
                lineIndex: 8,
                explanation: `Increment i to point to the next higher index (${k + 1}).`,
                execute: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.remove("active-traverse");
                    
                    state.auxIndex = k + 1;
                    if (k + 1 <= state.maxCapacity - 1) {
                        alignPointer("aux-pointer", k + 1, true);
                    } else {
                        alignPointer("aux-pointer", -1, false);
                    }
                },
                undo: () => {
                    const cell = document.querySelector(`.array-cell[data-index="${k}"]`);
                    if (cell) cell.classList.add("active-traverse");
                    
                    state.auxIndex = k;
                    alignPointer("aux-pointer", k, true);
                }
            });
        }
        
        // Line 6 again when false
        steps.push({
            lineIndex: 6,
            explanation: `Check condition: i (${topLimit + 1}) is now greater than top (${topLimit}). (Condition is False). Exit loop.`,
            execute: () => {
                state.showAux = false;
                alignPointer("aux-pointer", -1, false);
            },
            undo: () => {
                state.showAux = true;
                state.auxIndex = topLimit;
                alignPointer("aux-pointer", topLimit, true);
            }
        });
        
        // Line 11: STOP
        steps.push({
            lineIndex: 11,
            explanation: "Display completes successfully.",
            execute: () => {
                addLog("Display complete.", "success");
            },
            undo: () => {
                removeLastLog();
            }
        });
    }
    
    return steps;
}

// Controller Simulation Actions
function triggerOperation(opName, arg = null) {
    if (state.activeOp !== null) {
        resetSimulationState();
    }
    
    state.activeOp = opName;
    
    // Generate steps array
    if (opName === "push") {
        state.steps = makePushSteps(arg);
    } else if (opName === "pop") {
        state.steps = makePopSteps();
    } else if (opName === "peek") {
        state.steps = makePeekSteps();
    } else if (opName === "traverse") {
        state.steps = makeTraverseSteps();
    } else if (opName === "isempty") {
        state.steps = makeIsEmptySteps();
    } else if (opName === "isfull") {
        state.steps = makeIsFullSteps();
    } else if (opName === "display") {
        state.steps = makeDisplaySteps();
    }
    
    state.currentStepIndex = -1; // Ready to debug, no steps run yet
    
    // Load code visually
    loadPseudocode(opName);
    clearLineHighlights();
    
    // Update step counter UI: Step 0 / N
    updateStepCounterUI();
    
    // Classroom name resolution
    const friendlyNames = {
        push: `Push(${arg})`,
        pop: "Pop()",
        peek: "Peek()",
        traverse: "Traverse()",
        isempty: "isEmpty()",
        isfull: "isFull()",
        display: "Display()"
    };
    
    document.getElementById("current-op-name").textContent = friendlyNames[opName];
    document.getElementById("explanation-text").textContent = `Loaded ${friendlyNames[opName]} operation. Click "Next Step" to execute the first step: Check stack state.`;
    
    // Set status badge to WAITING
    const statusBadge = document.getElementById("debugger-status");
    statusBadge.textContent = "WAITING";
    statusBadge.className = "debugger-badge active";
    
    // Disable inputs / lock controls
    setControlsLockState(true);
}

function nextStep() {
    if (state.activeOp === null || state.currentStepIndex >= state.steps.length - 1) return;
    
    state.currentStepIndex++;
    
    // Execute the model changes and visual highlights
    const step = state.steps[state.currentStepIndex];
    step.execute();
    
    // Update debugger highlight & explanation text
    highlightLine(step.lineIndex);
    document.getElementById("explanation-text").textContent = step.explanation;
    
    // Refresh visual counters and statistics
    updateStepCounterUI();
    updateStatsUI();
    
    // Check if finished
    const statusBadge = document.getElementById("debugger-status");
    if (state.currentStepIndex === state.steps.length - 1) {
        statusBadge.textContent = "FINISHED";
        statusBadge.className = "debugger-badge finished";
        setControlsLockState(false); // Unlocks actions, keeps step buttons correct
    } else {
        statusBadge.textContent = "RUNNING";
        statusBadge.className = "debugger-badge active";
    }
    
    updateStepperButtonsState();
}

function previousStep() {
    if (state.activeOp === null || state.currentStepIndex < 0) return;
    
    // Run the undo method of the active step
    const step = state.steps[state.currentStepIndex];
    step.undo();
    
    state.currentStepIndex--;
    
    const statusBadge = document.getElementById("debugger-status");
    
    if (state.currentStepIndex === -1) {
        // Returned to start boundary
        clearLineHighlights();
        
        const friendlyNames = {
            push: `Push`,
            pop: "Pop",
            peek: "Peek",
            traverse: "Traverse",
            isempty: "isEmpty",
            isfull: "isFull",
            display: "Display"
        };
        
        document.getElementById("explanation-text").textContent = `Loaded operation. Click "Next Step" to execute the first step: Check stack state.`;
        statusBadge.textContent = "WAITING";
        statusBadge.className = "debugger-badge active";
        
        // Lock actions again
        setControlsLockState(true);
    } else {
        // Highlight previous step
        const prevStep = state.steps[state.currentStepIndex];
        highlightLine(prevStep.lineIndex);
        document.getElementById("explanation-text").textContent = prevStep.explanation;
        
        statusBadge.textContent = "RUNNING";
        statusBadge.className = "debugger-badge active";
    }
    
    updateStepCounterUI();
    updateStatsUI();
    updateStepperButtonsState();
}

function resetSimulationState() {
    // Clear code highlights
    clearLineHighlights();
    
    // Clear auxiliary pointers
    state.showAux = false;
    state.auxIndex = -1;
    alignPointer("aux-pointer", -1, false);
    
    // Remove active styles from cells
    const cells = document.querySelectorAll(".array-cell");
    cells.forEach(cell => {
        cell.classList.remove(
            "active-boundary", 
            "active-boundary-ok", 
            "active-push", 
            "active-pop", 
            "active-peek", 
            "active-traverse"
        );
    });
    
    // Revert animation styles
    const pointer = document.getElementById("top-pointer");
    if (pointer) pointer.style.animation = "";
    
    state.activeOp = null;
    state.steps = [];
    state.currentStepIndex = -1;
}

function handleReset() {
    resetSimulationState();
    
    // Reinitialize state array values to empty
    state.stackArray = new Array(state.maxCapacity).fill(null);
    state.topIndex = -1;
    state.logs = [];
    
    // Redraw Array
    renderArray();
    
    // Reset Labels
    document.getElementById("current-op-name").textContent = "No active operation";
    document.getElementById("explanation-text").textContent = "Select a stack operation from the control panel below, then use \"Next Step\" to begin stepping through the logic.";
    
    // Reset Pseudocode view
    const wrapper = document.getElementById("code-lines-wrapper");
    wrapper.innerHTML = `<div class="empty-code-placeholder">Select an operation to load pseudocode</div>`;
    
    // Reset Counter UI
    document.getElementById("step-counter-ui").textContent = "Step: -- / --";
    
    // Reset Status Badge
    const statusBadge = document.getElementById("debugger-status");
    statusBadge.textContent = "IDLE";
    statusBadge.className = "debugger-badge";
    
    // Unlock operations
    setControlsLockState(false);
    
    // Clear Terminal logs
    const consoleLogs = document.getElementById("console-logs");
    consoleLogs.innerHTML = `<div class="console-line system">> Visualizer reset. Ready for operations.</div>`;
    
    // Align pointers
    alignPointer("top-pointer", -1, true);
    alignPointer("aux-pointer", -1, false);
}

function handleResize() {
    const input = document.getElementById("stack-size-input");
    let val = parseInt(input.value);
    
    if (isNaN(val) || val < 3 || val > 10) {
        alert("Please enter a valid capacity between 3 and 10.");
        input.value = state.maxCapacity;
        return;
    }
    
    state.maxCapacity = val;
    handleReset();
    addLog(`Resized stack capacity to ${val}.`, "system");
}

// Dynamic Cell Size Adjuster
function adjustCellSizes() {
    const container = document.getElementById("array-container");
    if (!container) return;
    
    const availableWidth = container.clientWidth || container.parentElement.clientWidth || 800;
    const padding = 20; // Safe horizontal padding
    const gap = 14;     // Matches CSS grid gap
    const capacity = state.maxCapacity;
    
    const totalGaps = (capacity - 1) * gap;
    const calcWidth = (availableWidth - padding - totalGaps) / capacity;
    
    // Clamp box width between 65px (capacity 10) and 110px (capacity 3)
    const cellWidth = Math.min(110, Math.max(65, calcWidth));
    
    container.style.setProperty('--cell-size', `${cellWidth}px`);
}

// Visual DOM Render Updates
function renderArray() {
    const container = document.getElementById("array-container");
    container.innerHTML = "";
    
    // Apply dynamic width sizing
    adjustCellSizes();
    
    for (let i = 0; i < state.maxCapacity; i++) {
        const cell = document.createElement("div");
        cell.className = "array-cell";
        cell.setAttribute("data-index", i);
        
        const valSpan = document.createElement("span");
        valSpan.className = "cell-val";
        if (state.stackArray[i] !== null && state.stackArray[i] !== undefined) {
            valSpan.textContent = state.stackArray[i];
            cell.classList.add("filled");
        } else {
            valSpan.textContent = "";
        }
        
        const indexSpan = document.createElement("span");
        indexSpan.className = "array-cell-index";
        indexSpan.textContent = i;
        
        cell.appendChild(valSpan);
        cell.appendChild(indexSpan);
        container.appendChild(cell);
    }
    
    updateStatsUI();
}

function alignPointer(elementId, index, show = true) {
    const pointer = document.getElementById(elementId);
    if (!pointer) return;
    
    if (!show) {
        pointer.style.opacity = "0";
        return;
    }
    
    // Determine screen position coordinates using safe bounding rect boundaries
    if (index === -1 && elementId === "top-pointer") {
        const cell0 = document.querySelector('.array-cell[data-index="0"]');
        if (cell0) {
            const cellRect = cell0.getBoundingClientRect();
            const trackRect = pointer.parentElement.getBoundingClientRect();
            // Dynamically calculate cell width + gap (14px) offset
            const offset = cellRect.width + 14;
            const pos = (cellRect.left - trackRect.left) - offset;
            pointer.style.transform = `translateX(${pos}px)`;
            pointer.style.opacity = "1";
        }
        return;
    }
    
    const cell = document.querySelector(`.array-cell[data-index="${index}"]`);
    if (cell) {
        const cellRect = cell.getBoundingClientRect();
        const trackRect = pointer.parentElement.getBoundingClientRect();
        const pos = cellRect.left - trackRect.left;
        pointer.style.transform = `translateX(${pos}px)`;
        pointer.style.opacity = "1";
    } else {
        pointer.style.opacity = "0";
    }
}

function realignPointers() {
    adjustCellSizes();
    alignPointer("top-pointer", state.topIndex);
    if (state.activeOp === "traverse" || state.activeOp === "display") {
        alignPointer("aux-pointer", state.auxIndex, state.showAux);
    }
}

// Helper Utilities
function getStackSize() {
    return state.topIndex + 1;
}

function updateStatsUI() {
    const statsSummary = document.getElementById("stats-summary-ui");
    if (statsSummary) {
        statsSummary.textContent = `Size: ${getStackSize()} / Capacity: ${state.maxCapacity}`;
    }
    
    const badgeEmpty = document.getElementById("badge-empty");
    const badgeFull = document.getElementById("badge-full");
    
    if (state.topIndex === -1) {
        badgeEmpty.classList.remove("hidden");
    } else {
        badgeEmpty.classList.add("hidden");
    }
    
    if (state.topIndex === state.maxCapacity - 1) {
        badgeFull.classList.remove("hidden");
    } else {
        badgeFull.classList.add("hidden");
    }
}

function updateStepCounterUI() {
    const counterEl = document.getElementById("step-counter-ui");
    if (state.activeOp === null) {
        counterEl.textContent = "Step: -- / --";
    } else {
        const stepNum = state.currentStepIndex + 1;
        counterEl.textContent = `Step: ${stepNum} / ${state.steps.length}`;
    }
}

function highlightLine(lineNum) {
    clearLineHighlights();
    const lineEl = document.getElementById(`code-line-${lineNum}`);
    if (lineEl) {
        lineEl.classList.add("line-highlight");
        lineEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
}

function clearLineHighlights() {
    const lines = document.querySelectorAll(".code-line.line-highlight");
    lines.forEach(el => el.classList.remove("line-highlight"));
}

function loadPseudocode(opName) {
    const lines = PSEUDOCODE_DATA[opName];
    const wrapper = document.getElementById("code-lines-wrapper");
    wrapper.innerHTML = "";
    
    lines.forEach((line, index) => {
        const lineDiv = document.createElement("div");
        lineDiv.className = "code-line";
        lineDiv.id = `code-line-${index + 1}`;
        lineDiv.textContent = line;
        wrapper.appendChild(lineDiv);
    });
}

function addLog(text, type = "system") {
    state.logs.push({ text, type });
    renderLogs();
}

function removeLastLog() {
    state.logs.pop();
    renderLogs();
}

function renderLogs() {
    const consoleLogs = document.getElementById("console-logs");
    consoleLogs.innerHTML = "";
    
    state.logs.forEach(log => {
        const line = document.createElement("div");
        line.className = `console-line ${log.type}`;
        line.textContent = `> ${log.text}`;
        consoleLogs.appendChild(line);
    });
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

function setControlsLockState(lock) {
    document.getElementById("stack-size-input").disabled = lock;
    document.getElementById("set-size-btn").disabled = lock;
    document.getElementById("push-value-input").disabled = lock;
    document.getElementById("op-push-btn").disabled = lock;
    document.getElementById("op-pop-btn").disabled = lock;
    document.getElementById("op-peek-btn").disabled = lock;
    document.getElementById("op-traverse-btn").disabled = lock;
    document.getElementById("op-isempty-btn").disabled = lock;
    document.getElementById("op-isfull-btn").disabled = lock;
    document.getElementById("op-display-btn").disabled = lock;
    
    updateStepperButtonsState();
}

function updateStepperButtonsState() {
    const prevBtn = document.getElementById("prev-step-btn");
    const nextBtn = document.getElementById("next-step-btn");
    
    if (state.activeOp === null) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        prevBtn.disabled = (state.currentStepIndex === -1);
        nextBtn.disabled = (state.currentStepIndex === state.steps.length - 1);
    }
}

// Event Bindings
function setupEventListeners() {
    // Operations
    document.getElementById("op-push-btn").addEventListener("click", () => {
        const input = document.getElementById("push-value-input");
        const val = input.value.trim();
        if (val === "") {
            alert("Please enter a value to push.");
            return;
        }
        triggerOperation("push", val);
        input.value = "";
    });
    
    document.getElementById("op-pop-btn").addEventListener("click", () => {
        triggerOperation("pop");
    });
    
    document.getElementById("op-peek-btn").addEventListener("click", () => {
        triggerOperation("peek");
    });
    
    document.getElementById("op-traverse-btn").addEventListener("click", () => {
        triggerOperation("traverse");
    });
    
    document.getElementById("op-isempty-btn").addEventListener("click", () => {
        triggerOperation("isempty");
    });
    
    document.getElementById("op-isfull-btn").addEventListener("click", () => {
        triggerOperation("isfull");
    });
    
    document.getElementById("op-display-btn").addEventListener("click", () => {
        triggerOperation("display");
    });
    
    // Resize Controls
    document.getElementById("set-size-btn").addEventListener("click", handleResize);
    
    // Steppers
    document.getElementById("next-step-btn").addEventListener("click", nextStep);
    document.getElementById("prev-step-btn").addEventListener("click", previousStep);
    document.getElementById("reset-btn").addEventListener("click", handleReset);
    
    // Clear log button
    document.getElementById("clear-console-btn").addEventListener("click", () => {
        const consoleLogs = document.getElementById("console-logs");
        consoleLogs.innerHTML = `<div class="console-line system">> Logs cleared.</div>`;
        state.logs = [];
    });
    
    // Theory Toggle
    const theoryToggle = document.getElementById("theory-toggle");
    const theorySection = document.querySelector(".theory-section");
    theoryToggle.addEventListener("click", () => {
        const expanded = theoryToggle.getAttribute("aria-expanded") === "true";
        theoryToggle.setAttribute("aria-expanded", !expanded);
        theoryToggle.textContent = expanded ? "Expand" : "Collapse";
        if (expanded) {
            theorySection.classList.add("collapsed");
        } else {
            theorySection.classList.remove("collapsed");
        }
        setTimeout(realignPointers, 300); // Wait for collapse transition
    });
    
    // Resizing window handler
    window.addEventListener("resize", realignPointers);
}

// Initializer
window.addEventListener("DOMContentLoaded", () => {
    state.stackArray = new Array(state.maxCapacity).fill(null);
    state.topIndex = -1;
    state.logs = [];
    
    renderArray();
    setupEventListeners();
    
    // Position pointer initially at empty state (-1)
    setTimeout(() => {
        alignPointer("top-pointer", -1, true);
    }, 100);
});
