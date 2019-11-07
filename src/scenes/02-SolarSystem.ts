import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4 } from 'gl-matrix';

// This is the data type that describes the solar system
// It follows a tree like structure where every node defines a celestial object and its children if any
interface SolarSystemDescription {
    scale: number, // the radius of the object
    distanceFromParent: number, // How far is the object's center from its parent's center
    rotationSpeedAroundParent: number, // How fast it rotates (radians/ms) around the center of its parent
    rotationSpeedAroundSelf: number, // How fast it rotates (radians/ms) around its center
    tint: ArrayLike<number>, // A 4x4 matrix that changes the color of the object. Just send it to the tint variable
    children?: SolarSystemDescription[] // An optional list of children. If it is not included, it will be 'undefined'.
};


export default class SolarSystemScene extends Scene {
    program: ShaderProgram;
    mesh: Mesh;
    camera: Camera;
    controller: FlyCameraController;
    systems: {[name:string]:SolarSystemDescription};
    currentSystem: string;
    time: number = 0; // Use this variable for reading time
    playing: boolean = false;

    debugCubeMesh: Mesh;
    debugDrawCubes: boolean = false;

    public load(): void {
        this.game.loader.load({
            ["color.vert"]:{url:'shaders/color.vert', type:'text'},
            ["color.frag"]:{url:'shaders/color.frag', type:'text'},
            ["systems"]:{url:'data/solar-systems.json', type:'json'}
        });
    } 
    
    public start(): void {
        this.systems = this.game.loader.resources["systems"];
        this.currentSystem = Object.keys(this.systems)[0];

        this.program = new ShaderProgram(this.gl);
        this.program.attach(this.game.loader.resources["color.vert"], this.gl.VERTEX_SHADER);
        this.program.attach(this.game.loader.resources["color.frag"], this.gl.FRAGMENT_SHADER);
        this.program.link();

        this.mesh = MeshUtils.ColoredSphere(this.gl);
        this.debugCubeMesh = MeshUtils.ColoredCube(this.gl);

        this.gl.clearColor(0,0,0,1);

        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(100,100,100);
        this.camera.setTarget(vec3.fromValues(0,0,0));
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.5;

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.setupControls();
    }
    
    public draw(deltaTime: number): void {
        this.controller.update(deltaTime);
        if(this.playing) this.time += deltaTime;
        this.updateControls();

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.program.use();

        this.drawSystem(this.camera.ViewProjectionMatrix, this.systems[this.currentSystem]);
        
    }

    private drawSystem(parent: mat4, system: SolarSystemDescription){
        // TODO: Modify this function to draw the whole solar system
        let matPlanet = mat4.clone(parent);
        mat4.rotateY(matPlanet, matPlanet, this.time*system.rotationSpeedAroundSelf);
        mat4.scale(matPlanet, matPlanet, [system.scale, system.scale, system.scale]);

        this.drawSphere(matPlanet, system.tint);

        if(system.children) 
            console.log(`This object has ${system.children.length} ${system.children.length==1?"child":"children"}`);
    }

    // Given an MVP and a tint matrix, it draws a sphere
    private drawSphere(MVP: mat4, tint: ArrayLike<number>) {
        this.program.setUniformMatrix4fv("MVP", false, MVP);
        this.program.setUniformMatrix4fv("tint", false, tint);

        if(this.debugDrawCubes) this.debugCubeMesh.draw(this.gl.TRIANGLES);
        else this.mesh.draw(this.gl.TRIANGLES);
    }
    
    public end(): void {
        this.program.dispose();
        this.program = null;
        this.mesh.dispose();
        this.mesh = null;
        this.clearControls();
    }

    /////////////////////////////////////////////////////////
    ////// ADD CONTROL TO THE WEBPAGE (NOT IMPORTNANT) //////
    /////////////////////////////////////////////////////////
    controls: {[name: string]:HTMLInputElement} = {};

    private setupControls() {
        const controls = document.querySelector('#controls');
        
        const addLabel = (element: HTMLElement, text: string) => {
            let label = document.createElement('label');
            label.className = "control-label";
            label.textContent = text;
            element.appendChild(label);
        }

        const addNumber = (element: HTMLElement, value: number, callback: (value: number)=>void): HTMLInputElement => {
            let textbox = document.createElement('input');
            textbox.type = "number";
            textbox.step = "10";
            textbox.value = value.toString();
            textbox.onchange = () => { callback(Number.parseFloat(textbox.value)) };
            element.appendChild(textbox);
            return textbox;
        }

        const addButton = (element: HTMLElement, text: string, callback: ()=>void): HTMLButtonElement => {
            let button = document.createElement('button');
            button.textContent = text;
            button.onclick = callback;
            element.appendChild(button);
            return button;
        }

        const addSelect = (element: HTMLElement, options: string[], value: string, callback: (value: string)=>void): HTMLSelectElement => {
            let select = document.createElement('select');
            for(let option of options){
                let optionElement = document.createElement('option');
                optionElement.text = optionElement.value = option;
                select.appendChild(optionElement);
            }
            select.value = value;
            select.onchange = (ev) => callback(select.value);
            element.appendChild(select);
            return select;
        }

        const addCheckBox = (element: HTMLElement, value: boolean, callback: (value: boolean)=>void) => {
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.checked = value;
            checkbox.onchange = () => { callback(checkbox.checked) };
            element.appendChild(checkbox);
        }

        let SystemDiv = document.createElement('div');
        SystemDiv.className = "control-row";
        addLabel(SystemDiv, "Solar System");
        addSelect(SystemDiv, Object.keys(this.systems), this.currentSystem, (value)=>{this.currentSystem=value});
        controls.appendChild(SystemDiv);

        let TimeDiv = document.createElement('div');
        TimeDiv.className = "control-row";
        addLabel(TimeDiv, "Time");
        this.controls['time'] = addNumber(TimeDiv, this.time, (value: number) => {
            this.time = value;
        });
        const playButton = addButton(TimeDiv, this.playing?"Pause":"Play", ()=>{
            this.playing = !this.playing;
            playButton.textContent = this.playing?"Pause":"Play";
        });
        controls.appendChild(TimeDiv);

        let CameraDiv = document.createElement('div');
        CameraDiv.className = "control-row";
        addLabel(CameraDiv, "Camera");
        addButton(CameraDiv, "Reset", ()=>{
            this.camera.type = 'perspective';
            this.camera.position = vec3.fromValues(100,100,100);
            this.camera.setTarget(vec3.fromValues(0,0,0));
            this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
            this.controller = new FlyCameraController(this.camera, this.game.input);
            this.controller.movementSensitivity = 0.5;
        });
        controls.appendChild(CameraDiv);

        let DebugDiv = document.createElement('div');
        DebugDiv.className = "control-row";
        addCheckBox(DebugDiv, this.debugDrawCubes, (value)=>{this.debugDrawCubes = value;});
        addLabel(DebugDiv, "Draw Cubes (Debug)");
        addButton(DebugDiv, "Screenshot", ()=>{
            let link = document.createElement('a');
            link.download = `${this.currentSystem}@${this.time}${this.debugDrawCubes?'-Cubes':''}`;
            link.href = this.game.canvas.toDataURL("image/png;base64");
            let event = document.createEvent("MouseEvents");
            event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
        });
        controls.appendChild(DebugDiv);
    }

    private updateControls() {
        if(this.playing) this.controls['time'].value = this.time.toString();
    }

    private clearControls() {
        const controls = document.querySelector('#controls');
        controls.innerHTML = "";
    }

}