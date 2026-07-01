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
    if (!container) return;
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
    
    if (!badgeEmpty || !badgeFull) return;
    
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
    if (!counterEl) return;
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
    if (!wrapper) return;
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
    if (!consoleLogs) return;
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
    const ids = [
        "stack-size-input", "set-size-btn", "push-value-input", 
        "op-push-btn", "op-pop-btn", "op-peek-btn", 
        "op-traverse-btn", "op-isempty-btn", "op-isfull-btn", "op-display-btn"
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = lock;
    });
    
    updateStepperButtonsState();
}

function updateStepperButtonsState() {
    const prevBtn = document.getElementById("prev-step-btn");
    const nextBtn = document.getElementById("next-step-btn");
    if (!prevBtn || !nextBtn) return;
    
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
    const pushBtn = document.getElementById("op-push-btn");
    if (pushBtn) {
        pushBtn.addEventListener("click", () => {
            const input = document.getElementById("push-value-input");
            const val = input.value.trim();
            if (val === "") {
                alert("Please enter a value to push.");
                return;
            }
            triggerOperation("push", val);
            input.value = "";
        });
    }
    
    const popBtn = document.getElementById("op-pop-btn");
    if (popBtn) {
        popBtn.addEventListener("click", () => {
            triggerOperation("pop");
        });
    }
    
    const peekBtn = document.getElementById("op-peek-btn");
    if (peekBtn) {
        peekBtn.addEventListener("click", () => {
            triggerOperation("peek");
        });
    }
    
    const travBtn = document.getElementById("op-traverse-btn");
    if (travBtn) {
        travBtn.addEventListener("click", () => {
            triggerOperation("traverse");
        });
    }
    
    const isEBtn = document.getElementById("op-isempty-btn");
    if (isEBtn) {
        isEBtn.addEventListener("click", () => {
            triggerOperation("isempty");
        });
    }
    
    const isFBtn = document.getElementById("op-isfull-btn");
    if (isFBtn) {
        isFBtn.addEventListener("click", () => {
            triggerOperation("isfull");
        });
    }
    
    const dispBtn = document.getElementById("op-display-btn");
    if (dispBtn) {
        dispBtn.addEventListener("click", () => {
            triggerOperation("display");
        });
    }
    
    // Resize Controls
    const resizeBtn = document.getElementById("set-size-btn");
    if (resizeBtn) {
        resizeBtn.addEventListener("click", handleResize);
    }
    
    // Steppers
    const nextBtn = document.getElementById("next-step-btn");
    if (nextBtn) nextBtn.addEventListener("click", nextStep);
    
    const prevBtn = document.getElementById("prev-step-btn");
    if (prevBtn) prevBtn.addEventListener("click", previousStep);
    
    const rstBtn = document.getElementById("reset-btn");
    if (rstBtn) rstBtn.addEventListener("click", handleReset);
    
    // Clear log button
    const clearBtn = document.getElementById("clear-console-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const consoleLogs = document.getElementById("console-logs");
            if (consoleLogs) consoleLogs.innerHTML = `<div class="console-line system">> Logs cleared.</div>`;
            state.logs = [];
        });
    }
    
    // Theory Toggle
    const theoryToggle = document.getElementById("theory-toggle");
    const theorySection = document.querySelector(".theory-section");
    if (theoryToggle && theorySection) {
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
    }
    
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

// ===== PRACTICAL 2 START =====

/**
 * Practical 2 — Infix to Postfix Expression Conversion using Stack
 * Simulation State Model, Token Transition Validator & Visual Step Engine
 */

// Practical 2 Simulation State Model
const infixState = {
    infixExpression: "",
    postfixResult: "",
    operatorStack: [],
    scannedIndex: -1,
    processedSymbols: [], // Track completed symbol states for Table View: { symbol, stackAfter, postfixAfter }
    steps: [],
    currentStepIndex: -1,
    simulationActive: false,
    viewMode: "interactive", // "interactive" or "table"
    logs: []
};

// Operator Logic Helpers
function getPrecedence(op) {
    if (op === '^') return 3;
    if (op === '*' || op === '/') return 2;
    if (op === '+' || op === '-') return 1;
    if (op === '(') return 0;
    return -1;
}

function isLeftAssociative(op) {
    return op !== '^'; // ^ is right associative, others are left associative
}

function shouldPop(stackTop, currentOperator) {
    if (!stackTop || stackTop === '(') return false;
    
    const pTop = getPrecedence(stackTop);
    const pCurr = getPrecedence(currentOperator);
    
    return (
        pTop > pCurr ||
        (pTop === pCurr && isLeftAssociative(currentOperator))
    );
}

// Token-sequence Validation for Infix Input
function validateInfixExpression(infix) {
    // Strip all whitespaces
    const expr = infix.replace(/\s+/g, "");
    if (expr.length === 0) {
        return { valid: false, error: "Expression is empty." };
    }
    
    // Count and check balanced parenthesis groupings
    let parenCount = 0;
    for (let char of expr) {
        if (char === '(') parenCount++;
        else if (char === ')') {
            parenCount--;
            if (parenCount < 0) {
                return { valid: false, error: "Unbalanced parentheses: found closing parenthesis ')' without matching opening '('." };
            }
        }
    }
    if (parenCount !== 0) {
        return { valid: false, error: "Unbalanced parentheses: missing closing parenthesis ')'." };
    }

    // Classify character token types
    function getTokenType(char) {
        if (/[A-Za-z]/.test(char)) return "OPERAND";
        if (/[\+\-\*\/\^]/.test(char)) return "OPERATOR";
        if (char === '(') return "OPEN_PAREN";
        if (char === ')') return "CLOSE_PAREN";
        return "INVALID";
    }

    // Token transition verification loop
    let prevType = "START";
    let operandCount = 0;

    for (let i = 0; i < expr.length; i++) {
        const char = expr[i];
        const type = getTokenType(char);
        
        if (type === "INVALID") {
            return { valid: false, error: `Invalid character '${char}' detected. Supported tokens are A-Z, a-z, and operator symbols (+ - * / ^).` };
        }

        if (type === "OPERAND") {
            operandCount++;
        }

        // Validate allowed transitions
        if (prevType === "START") {
            if (type !== "OPERAND" && type !== "OPEN_PAREN") {
                return { valid: false, error: `Expression cannot start with operator or closing bracket: '${char}'` };
            }
        } else if (prevType === "OPERAND") {
            if (type !== "OPERATOR" && type !== "CLOSE_PAREN") {
                return { valid: false, error: `Operand '${expr[i-1]}' cannot be followed directly by '${char}'. Multi-character variables are not supported.` };
            }
        } else if (prevType === "OPERATOR") {
            if (type !== "OPERAND" && type !== "OPEN_PAREN") {
                return { valid: false, error: `Operator '${expr[i-1]}' cannot be followed directly by '${char}'. Consecutive operators and unary symbols are unsupported.` };
            }
        } else if (prevType === "OPEN_PAREN") {
            if (type !== "OPERAND" && type !== "OPEN_PAREN") {
                return { valid: false, error: `Opening parenthesis '(' cannot be followed directly by '${char}' (empty parentheses or operators are invalid).` };
            }
        } else if (prevType === "CLOSE_PAREN") {
            if (type !== "OPERATOR" && type !== "CLOSE_PAREN") {
                return { valid: false, error: `Closing parenthesis ')' cannot be followed directly by '${char}' (operands must be separated by operators).` };
            }
        }
        
        prevType = type;
    }

    if (operandCount === 0) {
        return { valid: false, error: "Expression must contain at least one single-character operand." };
    }

    if (prevType === "OPERATOR") {
        return { valid: false, error: "Expression cannot end with an operator." };
    }

    return { valid: true, sanitized: expr };
}

// Infix to Postfix Microstep Generator
function generateInfixSteps(expr) {
    const steps = [];
    
    // Virtual variables simulate step operations to capture target state snapshots
    let virtualStack = [];
    let virtualPostfix = "";
    let virtualScannedIndex = -1;
    let virtualProcessedSymbols = [];
    let virtualLogs = [{ text: `Initialized visual simulation for: ${expr}`, type: "system" }];

    function getSnapshot() {
        return {
            scannedIndex: virtualScannedIndex,
            operatorStack: [...virtualStack],
            postfixResult: virtualPostfix,
            processedSymbols: JSON.parse(JSON.stringify(virtualProcessedSymbols)),
            logs: JSON.parse(JSON.stringify(virtualLogs))
        };
    }

    let lastSnap = getSnapshot();

    function addStep(lineIndex, explanation, mutationFn) {
        mutationFn();
        const nextSnap = getSnapshot();
        const currentBefore = lastSnap;
        const currentAfter = nextSnap;
        
        steps.push({
            lineIndex,
            explanation,
            execute: () => {
                infixState.scannedIndex = currentAfter.scannedIndex;
                infixState.operatorStack = [...currentAfter.operatorStack];
                infixState.postfixResult = currentAfter.postfixResult;
                infixState.processedSymbols = JSON.parse(JSON.stringify(currentAfter.processedSymbols));
                infixState.logs = JSON.parse(JSON.stringify(currentAfter.logs));
                renderPractical2();
            },
            undo: () => {
                infixState.scannedIndex = currentBefore.scannedIndex;
                infixState.operatorStack = [...currentBefore.operatorStack];
                infixState.postfixResult = currentBefore.postfixResult;
                infixState.processedSymbols = JSON.parse(JSON.stringify(currentBefore.processedSymbols));
                infixState.logs = JSON.parse(JSON.stringify(currentBefore.logs));
                renderPractical2();
            }
        });
        
        lastSnap = nextSnap;
    }

    // Traverse the infix expression characters
    for (let i = 0; i < expr.length; i++) {
        const symbol = expr[i];
        
        // Step 1: Scan symbol
        addStep(2, `Scan symbol '${symbol}' at position ${i + 1} from left to right.`, () => {
            virtualScannedIndex = i;
            virtualLogs.push({ text: `Scan character '${symbol}'`, type: "info" });
        });

        // Step 2: Classify and route symbol
        if (/[A-Za-z]/.test(symbol)) {
            // IF symbol is operand
            addStep(4, `Symbol '${symbol}' is an operand. Append it directly to the postfix output.`, () => {
                virtualPostfix += symbol;
                virtualLogs.push({ text: `Append operand '${symbol}' to postfix`, type: "success" });
                // Append processed row for table snapshot after fully processing the symbol
                virtualProcessedSymbols.push({
                    symbol: symbol,
                    stackAfter: [...virtualStack],
                    postfixAfter: virtualPostfix,
                    stepIndex: steps.length
                });
            });
        }
        else if (symbol === '(') {
            // ELSE IF symbol is '('
            addStep(6, `Symbol is '('. Push it onto the operator stack.`, () => {
                virtualStack.push('(');
                virtualLogs.push({ text: `Push '(' onto stack`, type: "system" });
                virtualProcessedSymbols.push({
                    symbol: '(',
                    stackAfter: [...virtualStack],
                    postfixAfter: virtualPostfix,
                    stepIndex: steps.length
                });
            });
        }
        else if (symbol === ')') {
            // ELSE IF symbol is ')' -> pop and append until '('
            while (virtualStack.length > 0 && virtualStack[virtualStack.length - 1] !== '(') {
                const topOp = virtualStack[virtualStack.length - 1];
                addStep(8, `Symbol is ')'. Pop operator '${topOp}' from stack and append to postfix output.`, () => {
                    const popped = virtualStack.pop();
                    virtualPostfix += popped;
                    virtualLogs.push({ text: `Popped '${popped}' from stack`, type: "warn" });
                });
            }
            
            // Pop and discard '('
            addStep(9, `Opening parenthesis '(' is popped and discarded from the stack.`, () => {
                virtualStack.pop(); // discard '('
                virtualLogs.push({ text: `Discarded '(' from stack`, type: "system" });
                virtualProcessedSymbols.push({
                    symbol: ')',
                    stackAfter: [...virtualStack],
                    postfixAfter: virtualPostfix,
                    stepIndex: steps.length
                });
            });
        }
        else {
            // ELSE (operator) -> pop while shouldPop is true
            while (virtualStack.length > 0 && shouldPop(virtualStack[virtualStack.length - 1], symbol)) {
                const topOp = virtualStack[virtualStack.length - 1];
                addStep(12, `Compare precedence: stack top '${topOp}' has higher or equal precedence than '${symbol}'. Pop '${topOp}' and append to postfix.`, () => {
                    const popped = virtualStack.pop();
                    virtualPostfix += popped;
                    virtualLogs.push({ text: `Popped '${popped}' from stack (precedence hierarchy check)`, type: "warn" });
                });
            }
            
            // Push symbol
            addStep(13, `Push operator '${symbol}' onto the stack.`, () => {
                virtualStack.push(symbol);
                virtualLogs.push({ text: `Pushed operator '${symbol}' onto stack`, type: "success" });
                virtualProcessedSymbols.push({
                    symbol: symbol,
                    stackAfter: [...virtualStack],
                    postfixAfter: virtualPostfix,
                    stepIndex: steps.length
                });
            });
        }
    }

    // Flush remaining operator elements
    if (virtualStack.length > 0) {
        addStep(15, "Scanning complete. Stack is not empty. Prepare to pop remaining operators.", () => {
            virtualLogs.push({ text: "Scanning complete. Flushing stack...", type: "info" });
        });
        
        while (virtualStack.length > 0) {
            const topOp = virtualStack[virtualStack.length - 1];
            addStep(16, `Pop remaining operator '${topOp}' from stack and append to postfix output.`, () => {
                const popped = virtualStack.pop();
                virtualPostfix += popped;
                virtualLogs.push({ text: `Popped remaining operator '${popped}' from stack`, type: "warn" });
                
                if (virtualStack.length === 0) {
                    virtualProcessedSymbols.push({
                        symbol: "EOF",
                        stackAfter: [],
                        postfixAfter: virtualPostfix,
                        stepIndex: steps.length
                    });
                }
            });
        }
    } else {
        addStep(15, "Scanning complete. Stack is empty. Conversion complete.", () => {
            virtualLogs.push({ text: "Scanning complete. Stack is empty.", type: "info" });
            virtualProcessedSymbols.push({
                symbol: "EOF",
                stackAfter: [],
                postfixAfter: virtualPostfix,
                stepIndex: steps.length
            });
        });
    }

    return steps;
}

// Initializer / Reset Simulation for Infix to Postfix conversion
function initializePractical2Simulation(expr) {
    const validation = validateInfixExpression(expr);
    if (!validation.valid) {
        document.getElementById("explanation-text-p2").textContent = `Validation Error: ${validation.error}`;
        
        infixState.infixExpression = "";
        infixState.postfixResult = "";
        infixState.operatorStack = [];
        infixState.scannedIndex = -1;
        infixState.processedSymbols = [];
        infixState.steps = [];
        infixState.currentStepIndex = -1;
        infixState.simulationActive = false;
        
        renderPractical2();
        
        const consoleLogs = document.getElementById("console-logs-p2");
        if (consoleLogs) {
            consoleLogs.innerHTML = `<div class="console-line error">> Error: ${validation.error}</div>`;
        }
        return;
    }

    const sanitizedExpr = validation.sanitized;
    infixState.infixExpression = sanitizedExpr;
    infixState.postfixResult = "";
    infixState.operatorStack = [];
    infixState.scannedIndex = -1;
    infixState.processedSymbols = [];
    infixState.logs = [{ text: `Validated expression: ${sanitizedExpr}`, type: "success" }];
    
    // Generate step arrays
    infixState.steps = generateInfixSteps(sanitizedExpr);
    infixState.currentStepIndex = -1;
    infixState.simulationActive = true;
    
    renderPractical2();
    
    document.getElementById("explanation-text-p2").textContent = `Expression loaded successfully. Click "Next Step" to begin scan traversal.`;
    
    const statusBadge = document.getElementById("debugger-status-p2");
    if (statusBadge) {
        statusBadge.textContent = "WAITING";
        statusBadge.className = "debugger-badge active";
    }
}

// Stepper execution controls
function nextStepP2() {
    if (!infixState.simulationActive || infixState.currentStepIndex >= infixState.steps.length - 1) return;
    
    infixState.currentStepIndex++;
    const step = infixState.steps[infixState.currentStepIndex];
    step.execute();
    
    const statusBadge = document.getElementById("debugger-status-p2");
    if (statusBadge) {
        if (infixState.currentStepIndex === infixState.steps.length - 1) {
            statusBadge.textContent = "FINISHED";
            statusBadge.className = "debugger-badge finished";
        } else {
            statusBadge.textContent = "RUNNING";
            statusBadge.className = "debugger-badge active";
        }
    }
}

function previousStepP2() {
    if (!infixState.simulationActive || infixState.currentStepIndex < 0) return;
    
    const step = infixState.steps[infixState.currentStepIndex];
    step.undo();
    
    infixState.currentStepIndex--;
    
    const statusBadge = document.getElementById("debugger-status-p2");
    if (statusBadge) {
        if (infixState.currentStepIndex === -1) {
            statusBadge.textContent = "WAITING";
            statusBadge.className = "debugger-badge active";
            document.getElementById("explanation-text-p2").textContent = `Expression loaded successfully. Click "Next Step" to begin scan traversal.`;
        } else {
            statusBadge.textContent = "RUNNING";
            statusBadge.className = "debugger-badge active";
        }
    }
}

function resetSimulationP2() {
    if (!infixState.infixExpression) return;
    
    infixState.postfixResult = "";
    infixState.operatorStack = [];
    infixState.scannedIndex = -1;
    infixState.processedSymbols = [];
    infixState.currentStepIndex = -1;
    infixState.logs = [{ text: `Visualizer reset. Scanned expression: ${infixState.infixExpression}`, type: "system" }];
    
    renderPractical2();
    
    const statusBadge = document.getElementById("debugger-status-p2");
    if (statusBadge) {
        statusBadge.textContent = "WAITING";
        statusBadge.className = "debugger-badge active";
    }
    
    document.getElementById("explanation-text-p2").textContent = `Expression loaded successfully. Click "Next Step" to begin scan traversal.`;
}

// Visual DOM updates for Practical 2
function renderPractical2() {
    // 1. Step Counter UI
    const counterEl = document.getElementById("step-counter-ui-p2");
    if (counterEl) {
        if (infixState.steps.length === 0) {
            counterEl.textContent = "Step: -- / --";
        } else {
            const stepNum = infixState.currentStepIndex + 1;
            counterEl.textContent = `Step: ${stepNum} / ${infixState.steps.length}`;
        }
    }
    
    // 2. Pseudocode highlighting
    clearLineHighlightsP2();
    if (infixState.currentStepIndex === -1) {
        highlightLineP2(1); // START line highlight
    } else if (infixState.currentStepIndex === infixState.steps.length - 1) {
        highlightLineP2(17); // STOP line highlight
    } else {
        const step = infixState.steps[infixState.currentStepIndex];
        highlightLineP2(step.lineIndex);
        document.getElementById("explanation-text-p2").textContent = step.explanation;
    }
    
    // 3. Render Views
    renderInteractiveViewP2();
    renderTableViewP2();
    renderLogsP2();
    updateStepperButtonsStateP2();
}

function renderInteractiveViewP2() {
    const infixDisplay = document.getElementById("infix-display");
    const stackDisplay = document.getElementById("vertical-operator-stack");
    const postfixDisplay = document.getElementById("postfix-output-display");
    if (!infixDisplay || !stackDisplay || !postfixDisplay) return;
    
    if (!infixState.infixExpression) {
        infixDisplay.innerHTML = `<span class="empty-infix-placeholder">No expression loaded</span>`;
        stackDisplay.innerHTML = `<div class="empty-stack-msg">Empty</div>`;
        postfixDisplay.innerHTML = `<span class="empty-postfix-placeholder">Empty</span>`;
        return;
    }
    
    const step = infixState.steps[infixState.currentStepIndex];
    const isEOF = step && (step.lineIndex === 14 || step.lineIndex === 15 || step.lineIndex === 16);
    
    // Highlight characters in scan row
    infixDisplay.innerHTML = "";
    for (let i = 0; i < infixState.infixExpression.length; i++) {
        const char = infixState.infixExpression[i];
        const span = document.createElement("span");
        span.className = "infix-char";
        if (isEOF) {
            span.classList.add("scanned");
        } else {
            if (i === infixState.scannedIndex) {
                span.classList.add("active-char");
            } else if (i < infixState.scannedIndex) {
                span.classList.add("scanned");
            }
        }
        span.textContent = char;
        infixDisplay.appendChild(span);
    }
    
    // Append EOF badge
    const eofSpan = document.createElement("span");
    eofSpan.className = "infix-char eof-badge";
    eofSpan.textContent = "EOF";
    if (isEOF) {
        eofSpan.classList.add("active-char");
    }
    infixDisplay.appendChild(eofSpan);
    
    // Render operator stack list
    stackDisplay.innerHTML = "";
    if (infixState.operatorStack.length === 0) {
        stackDisplay.innerHTML = `<div class="empty-stack-msg">Empty</div>`;
    } else {
        infixState.operatorStack.forEach((char, index) => {
            const cell = document.createElement("div");
            cell.className = "p2-stack-cell";
            if (index === infixState.operatorStack.length - 1) {
                cell.classList.add("active-top");
            }
            cell.textContent = char;
            stackDisplay.appendChild(cell);
        });
    }
    
    // Render postfix outputs
    postfixDisplay.innerHTML = "";
    if (infixState.postfixResult.length === 0) {
        postfixDisplay.innerHTML = `<span class="empty-postfix-placeholder">Empty</span>`;
    } else {
        for (let char of infixState.postfixResult) {
            const span = document.createElement("span");
            span.className = "postfix-char";
            span.textContent = char;
            postfixDisplay.appendChild(span);
        }
    }
}

function renderTableViewP2() {
    const tableBody = document.getElementById("table-body-p2");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    
    // 0. Update the live symbol label above the table
    const liveSymbolVal = document.getElementById("table-live-symbol-val");
    let currentSymbolName = "-";
    if (infixState.currentStepIndex !== -1) {
        if (infixState.scannedIndex !== -1) {
            const step = infixState.steps[infixState.currentStepIndex];
            if (step && (step.lineIndex === 14 || step.lineIndex === 15 || step.lineIndex === 16)) {
                currentSymbolName = "EOF (Flush)";
            } else {
                currentSymbolName = infixState.infixExpression[infixState.scannedIndex] || "EOF";
            }
        } else {
            currentSymbolName = "START";
        }
    }
    if (liveSymbolVal) {
        liveSymbolVal.textContent = currentSymbolName;
    }
    
    // 1. Render finalized rows (finalized in steps before current step)
    const finalized = infixState.processedSymbols.filter(row => row.stepIndex !== undefined && row.stepIndex < infixState.currentStepIndex);
    
    finalized.forEach((row) => {
        const tr = document.createElement("tr");
        
        const tdStep = document.createElement("td");
        tdStep.textContent = `Step ${row.stepIndex + 1}`;
        tdStep.className = "step-num-col";
        
        const tdSymbol = document.createElement("td");
        tdSymbol.textContent = row.symbol;
        
        const tdStack = document.createElement("td");
        tdStack.textContent = row.stackAfter.length > 0 ? row.stackAfter.join(" ") : "empty";
        
        const tdPostfix = document.createElement("td");
        tdPostfix.textContent = row.postfixAfter || "empty";
        
        tr.appendChild(tdStep);
        tr.appendChild(tdSymbol);
        tr.appendChild(tdStack);
        tr.appendChild(tdPostfix);
        tableBody.appendChild(tr);
    });
    
    // 2. Append highlighted live row showing current step state
    if (infixState.currentStepIndex !== -1) {
        const tr = document.createElement("tr");
        tr.className = "live-row";
        
        const tdStep = document.createElement("td");
        tdStep.textContent = `Step ${infixState.currentStepIndex + 1}`;
        tdStep.className = "step-num-col";
        
        const tdSymbol = document.createElement("td");
        tdSymbol.textContent = currentSymbolName;
        
        const tdStack = document.createElement("td");
        tdStack.textContent = infixState.operatorStack.length > 0 ? infixState.operatorStack.join(" ") : "empty";
        
        const tdPostfix = document.createElement("td");
        tdPostfix.textContent = infixState.postfixResult || "empty";
        
        tr.appendChild(tdStep);
        tr.appendChild(tdSymbol);
        tr.appendChild(tdStack);
        tr.appendChild(tdPostfix);
        tableBody.appendChild(tr);
    }
    
    // 3. Auto-scroll only inside table scroll container to the latest row
    const scrollContainer = document.getElementById("table-scroll-container-p2");
    if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
}

function renderLogsP2() {
    const consoleLogs = document.getElementById("console-logs-p2");
    if (!consoleLogs) return;
    consoleLogs.innerHTML = "";
    
    infixState.logs.forEach(log => {
        const line = document.createElement("div");
        line.className = `console-line ${log.type}`;
        line.textContent = `> ${log.text}`;
        consoleLogs.appendChild(line);
    });
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

function highlightLineP2(lineNum) {
    clearLineHighlightsP2();
    const lineEl = document.getElementById(`code-line-p2-${lineNum}`);
    if (lineEl) {
        lineEl.classList.add("line-highlight");
        lineEl.scrollIntoView({ block: "center", behavior: "smooth" });
    }
}

function clearLineHighlightsP2() {
    const lines = document.querySelectorAll("#code-lines-wrapper-p2 .code-line.line-highlight");
    lines.forEach(el => el.classList.remove("line-highlight"));
}

function updateStepperButtonsStateP2() {
    const prevBtn = document.getElementById("prev-step-btn-p2");
    const nextBtn = document.getElementById("next-step-btn-p2");
    if (!prevBtn || !nextBtn) return;
    
    if (!infixState.simulationActive || infixState.steps.length === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        prevBtn.disabled = (infixState.currentStepIndex === -1);
        nextBtn.disabled = (infixState.currentStepIndex === infixState.steps.length - 1);
    }
}

// DOM Setup and Hook bindings for Practical 2 & Navigation
window.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar module switching logic
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    const mainTitle = document.getElementById("app-main-title");
    
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            if (item.classList.contains("disabled")) return;
            
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            const target = item.getAttribute("data-target");
            if (target === "practical-1") {
                document.getElementById("practical-1-wrapper").classList.remove("hidden");
                document.getElementById("practical-2-wrapper").classList.add("hidden");
                if (mainTitle) mainTitle.innerHTML = `Stack <span class="accent-text">using Array</span>`;
                
                // Realign pointers and recalculate arrays on switch back
                setTimeout(() => {
                    if (typeof realignPointers === "function") realignPointers();
                }, 100);
            } else if (target === "practical-2") {
                document.getElementById("practical-2-wrapper").classList.remove("hidden");
                document.getElementById("practical-1-wrapper").classList.add("hidden");
                if (mainTitle) mainTitle.innerHTML = `Infix to Postfix <span class="accent-text">Conversion</span>`;
                
                // Load default expression if none loaded yet
                if (!infixState.infixExpression) {
                    const defaultExpr = document.getElementById("infix-input").value.trim() || "A*(B+C-D)";
                    initializePractical2Simulation(defaultExpr);
                }
            }
        });
    });

    // 2. Collapsible sidebar logic
    const sidebar = document.getElementById("sidebar");
    const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
    const sidebarOpenBtn = document.getElementById("sidebar-open-btn");

    if (sidebar && sidebarToggleBtn && sidebarOpenBtn) {
        sidebarToggleBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            sidebarOpenBtn.style.display = "flex";
            setTimeout(() => {
                if (typeof realignPointers === "function") realignPointers();
            }, 300);
        });

        sidebarOpenBtn.addEventListener("click", () => {
            sidebar.classList.remove("collapsed");
            sidebarOpenBtn.style.display = "none";
            setTimeout(() => {
                if (typeof realignPointers === "function") realignPointers();
            }, 300);
        });
    }

    // 3. Dual visualization toggles
    const btnToggleInteractive = document.getElementById("btn-toggle-interactive");
    const btnToggleTable = document.getElementById("btn-toggle-table");
    const interactiveArea = document.getElementById("interactive-view-area");
    const tableArea = document.getElementById("table-view-area");

    if (btnToggleInteractive && btnToggleTable && interactiveArea && tableArea) {
        btnToggleInteractive.addEventListener("click", () => {
            btnToggleInteractive.classList.add("active");
            btnToggleTable.classList.remove("active");
            interactiveArea.classList.remove("hidden");
            tableArea.classList.add("hidden");
            infixState.viewMode = "interactive";
        });

        btnToggleTable.addEventListener("click", () => {
            btnToggleTable.classList.add("active");
            btnToggleInteractive.classList.remove("active");
            tableArea.classList.remove("hidden");
            interactiveArea.classList.add("hidden");
            infixState.viewMode = "table";
        });
    }

    // 4. Expression control panel inputs
    const btnInitP2 = document.getElementById("btn-init-p2");
    if (btnInitP2) {
        btnInitP2.addEventListener("click", () => {
            const input = document.getElementById("infix-input");
            if (input) {
                initializePractical2Simulation(input.value.trim());
            }
        });
    }

    // Example Presets Selector
    const presetButtons = document.querySelectorAll(".btn-preset");
    presetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const expr = btn.getAttribute("data-expr");
            const input = document.getElementById("infix-input");
            if (input) {
                input.value = expr;
            }
            initializePractical2Simulation(expr);
        });
    });

    // Steppers bindings
    const nextBtnP2 = document.getElementById("next-step-btn-p2");
    if (nextBtnP2) nextBtnP2.addEventListener("click", nextStepP2);

    const prevBtnP2 = document.getElementById("prev-step-btn-p2");
    if (prevBtnP2) prevBtnP2.addEventListener("click", previousStepP2);

    const rstBtnP2 = document.getElementById("reset-btn-p2");
    if (rstBtnP2) rstBtnP2.addEventListener("click", resetSimulationP2);

    // Clear logs console
    const clearBtnP2 = document.getElementById("clear-console-btn-p2");
    if (clearBtnP2) {
        clearBtnP2.addEventListener("click", () => {
            infixState.logs = [];
            renderLogsP2();
        });
    }

    // Slide-out Drawer triggers for Theory and C++ code
    const theoryTrigger = document.getElementById("p2-theory-trigger");
    const cppTrigger = document.getElementById("p2-cpp-trigger");
    const theoryDrawer = document.getElementById("p2-theory-drawer");
    const cppDrawer = document.getElementById("p2-cpp-drawer");
    const drawerOverlay = document.getElementById("p2-drawer-overlay");
    const theoryClose = document.getElementById("p2-theory-close-btn");
    const cppClose = document.getElementById("p2-cpp-close-btn");
    const cppFullscreenBtn = document.getElementById("p2-cpp-fullscreen-btn");
    const cppCopyBtn = document.getElementById("p2-cpp-copy-btn");

    function openP2Drawer(drawer) {
        if (!drawer) return;
        drawer.classList.add("open");
        if (drawerOverlay) drawerOverlay.classList.add("visible");
    }

    function closeAllP2Drawers() {
        if (theoryDrawer) theoryDrawer.classList.remove("open");
        if (cppDrawer) {
            cppDrawer.classList.remove("open");
            cppDrawer.classList.remove("fullscreen");
        }
        if (cppFullscreenBtn) {
            cppFullscreenBtn.innerHTML = "⛶ Fullscreen";
            cppFullscreenBtn.classList.remove("active");
        }
        if (drawerOverlay) drawerOverlay.classList.remove("visible");
    }

    if (theoryTrigger) {
        theoryTrigger.addEventListener("click", () => openP2Drawer(theoryDrawer));
    }
    if (cppTrigger) {
        cppTrigger.addEventListener("click", () => openP2Drawer(cppDrawer));
    }
    if (theoryClose) {
        theoryClose.addEventListener("click", closeAllP2Drawers);
    }
    if (cppClose) {
        cppClose.addEventListener("click", closeAllP2Drawers);
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener("click", closeAllP2Drawers);
    }

    // Fullscreen toggle event listener
    if (cppFullscreenBtn) {
        cppFullscreenBtn.addEventListener("click", () => {
            if (cppDrawer) {
                const isFullscreen = cppDrawer.classList.toggle("fullscreen");
                cppFullscreenBtn.innerHTML = isFullscreen ? "Collapse View" : "⛶ Fullscreen";
                cppFullscreenBtn.classList.toggle("active", isFullscreen);
            }
        });
    }

    // Copy C++ code to clipboard
    if (cppCopyBtn) {
        cppCopyBtn.addEventListener("click", () => {
            const codeToCopy = `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int precedence(char op) {
    if (op == '^') return 3;
    if (op == '*' || op == '/') return 2;
    if (op == '+' || op == '-') return 1;
    return 0;
}

bool isOperand(char c) {
    return isalnum(c);
}

string infixToPostfix(string expr) {
    stack<char> st;
    string result = "";

    for (char c : expr) {
        if (isOperand(c)) {
            result += c;
        }
        else if (c == '(') {
            st.push(c);
        }
        else if (c == ')') {
            while (!st.empty() && st.top() != '(') {
                result += st.top();
                st.pop();
            }
            if (!st.empty())
                st.pop();
        }
        else {
            while (!st.empty() &&
                   precedence(st.top()) >= precedence(c)) {
                result += st.top();
                st.pop();
            }
            st.push(c);
        }
    }

    while (!st.empty()) {
        result += st.top();
        st.pop();
    }

    return result;
}

int main() {
    string expr;
    cout << "Enter infix expression: ";
    cin >> expr;

    cout << "Postfix: "
         << infixToPostfix(expr)
         << endl;

    return 0;
}`;
            navigator.clipboard.writeText(codeToCopy).then(() => {
                const originalText = cppCopyBtn.innerHTML;
                cppCopyBtn.innerHTML = "✓ Copied!";
                cppCopyBtn.style.borderColor = "#10b981";
                cppCopyBtn.style.color = "#10b981";
                setTimeout(() => {
                    cppCopyBtn.innerHTML = originalText;
                    cppCopyBtn.style.borderColor = "";
                    cppCopyBtn.style.color = "";
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy code: ", err);
            });
        });
    }
});
