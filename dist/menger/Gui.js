import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3 } from "../lib/TSM.js";
/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
export class GUI {
    /**
     *
     * @param canvas required to get the width and height of the canvas
     * @param animation required as a back pointer for some of the controls
     * @param sponge required for some of the controls
     */
    constructor(canvas, animation, sponge) {
        this.height = canvas.height;
        this.width = canvas.width;
        this.prevX = 0;
        this.prevY = 0;
        this.sponge = sponge;
        this.animation = animation;
        this.reset();
        this.registerEventListeners(canvas);
    }
    /**
     * Resets the state of the GUI
     */
    reset() {
        // start in FPS mode by default (orbital can be toggled with C)
        this.fps = true;
        this.dragging = false;
        /* Create camera setup */
        this.camera = new Camera(new Vec3([0, 0, -6]), new Vec3([0, 0, 0]), new Vec3([0, 1, 0]), 45, this.width / this.height, 0.1, 1000.0);
    }
    /**
     * Sets the GUI's camera to the given camera
     * @param cam a new camera
     */
    setCamera(pos, target, upDir, fov, aspect, zNear, zFar) {
        this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
    }
    /**
     * Returns the view matrix of the camera
     */
    viewMatrix() {
        return this.camera.viewMatrix();
    }
    /**
     * Returns the projection matrix of the camera
     */
    projMatrix() {
        return this.camera.projMatrix();
    }
    /**
     * Callback function for the start of a drag event.
     * @param mouse
     */
    dragStart(mouse) {
        this.dragging = true;
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
    }
    /**
     * The callback function for a drag event.
     * This event happens after dragStart and
     * before dragEnd.
     * @param mouse
     */
    drag(mouse) {
        if (!this.dragging) {
            return;
        }
        const dx = mouse.screenX - this.prevX;
        const dy = mouse.screenY - this.prevY;
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
        // left button = 1, right button = 2
        if (mouse.buttons === 1) {
            // rotation
            if (this.fps) {
                // yaw and pitch
                if (dx !== 0) {
                    this.camera.yaw(GUI.rotationSpeed, dx > 0);
                }
                if (dy !== 0) {
                    this.camera.pitch(GUI.rotationSpeed, dy > 0);
                }
            }
            else {
                // orbital mode: orbit about up/right axes
                if (dx !== 0) {
                    this.camera.orbitTarget(this.camera.up(), dx * GUI.rotationSpeed);
                }
                if (dy !== 0) {
                    this.camera.orbitTarget(this.camera.right(), dy * GUI.rotationSpeed);
                }
            }
        }
        else if (mouse.buttons === 2) {
            // right-drag for zoom (optional)
            if (dy !== 0) {
                const dir = this.camera.forward().copy();
                // forward vector points backwards so reverse sign
                this.camera.offset(dir, dy > 0 ? GUI.zoomSpeed : -GUI.zoomSpeed, true);
            }
        }
    }
    /**
     * Callback function for the end of a drag event
     * @param mouse
     */
    dragEnd(mouse) {
        this.dragging = false;
        this.prevX = 0;
        this.prevY = 0;
    }
    /**
     * Callback function for a key press event
     * @param key
     */
    onKeydown(key) {
        /*
           Note: key.code uses key positions, i.e a QWERTY user uses y where
                 as a Dvorak user must press F for the same action.
           Note: arrow keys are only registered on a KeyDown event not a
           KeyPress event
           We can use KeyDown due to auto repeating.
         */
        // handle camera movement keys
        switch (key.code) {
            case "KeyW": {
                // forward/back along look direction
                const dir = this.camera.forward().copy().scale(-1); // forward() points backwards
                this.camera.offset(dir, GUI.zoomSpeed, true);
                break;
            }
            case "KeyA": {
                // strafe left
                const left = this.camera.right().copy().scale(-1);
                this.camera.offset(left, GUI.panSpeed, true);
                break;
            }
            case "KeyS": {
                // backward
                const back = this.camera.forward().copy();
                this.camera.offset(back, GUI.zoomSpeed, true);
                break;
            }
            case "KeyD": {
                // strafe right
                const right = this.camera.right();
                this.camera.offset(right, GUI.panSpeed, true);
                break;
            }
            case "KeyR": {
                // reset animation/camera
                this.animation.reset();
                break;
            }
            case "KeyC": {
                // toggle between FPS and orbital modes
                this.fps = !this.fps;
                console.log("FPS mode =", this.fps);
                break;
            }
            case "ArrowLeft": {
                this.camera.roll(GUI.rollSpeed, false); // ccw
                break;
            }
            case "ArrowRight": {
                this.camera.roll(GUI.rollSpeed, true); // cw
                break;
            }
            case "ArrowUp": {
                const updir = this.camera.up();
                this.camera.offset(updir, GUI.panSpeed, true);
                break;
            }
            case "ArrowDown": {
                const downdir = this.camera.up().copy().scale(-1);
                this.camera.offset(downdir, GUI.panSpeed, true);
                break;
            }
            case "Digit1": {
                this.animation.setLevel(1);
                break;
            }
            case "Digit2": {
                this.animation.setLevel(2);
                break;
            }
            case "Digit3": {
                this.animation.setLevel(3);
                break;
            }
            case "Digit4": {
                this.animation.setLevel(4);
                break;
            }
            default: {
                console.log("Key : '", key.code, "' was pressed.");
                break;
            }
        }
    }
    /**
     * Registers all event listeners for the GUI
     * @param canvas The canvas being used
     */
    registerEventListeners(canvas) {
        /* Event listener for key controls */
        window.addEventListener("keydown", (key) => this.onKeydown(key));
        /* Event listener for mouse controls */
        canvas.addEventListener("mousedown", (mouse) => this.dragStart(mouse));
        canvas.addEventListener("mousemove", (mouse) => this.drag(mouse));
        canvas.addEventListener("mouseup", (mouse) => this.dragEnd(mouse));
        /* Event listener to stop the right click menu */
        canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    }
}
GUI.rotationSpeed = 0.05;
GUI.zoomSpeed = 0.1;
GUI.rollSpeed = 0.1;
GUI.panSpeed = 0.1;
//# sourceMappingURL=Gui.js.map