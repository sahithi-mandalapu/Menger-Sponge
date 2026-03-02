export let defaultVSText = `
    precision mediump float;

    attribute vec4 vertPosition;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;   
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        vec4 worldPos = mWorld * vertPosition;
        gl_Position = mProj * mView * worldPos;
        
        // compute light dir in world space
        lightDir = lightPosition - worldPos;
        
        // transform normal to world space
        normal = mWorld * aNorm;
    }
`;

export let defaultFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;    
    
    void main () {
        vec3 n = normalize(normal.xyz);
        vec3 l = normalize(lightDir.xyz);
        float diffuse = max(dot(n, l), 0.0);

        vec3 baseColor;

        // Explicitly handle all six cube face directions
        if (n.x > 0.5) {
            baseColor = vec3(1.0, 0.0, 0.0); // +X face red
        } else if (n.x < -0.5) {
            baseColor = vec3(1.0, 0.0, 0.0); // -X face red
        } else if (n.y > 0.5) {
            baseColor = vec3(0.0, 1.0, 0.0); // +Y face green
        } else if (n.y < -0.5) {
            baseColor = vec3(0.0, 1.0, 0.0); // -Y face green
        } else if (n.z > 0.5) {
            baseColor = vec3(0.0, 0.0, 1.0); // +Z face blue
        } else {
            baseColor = vec3(0.0, 0.0, 1.0); // -Z face blue
        }

        // Apply diffuse shading with ambient so faces remain visible
        float ambient = 0.05;
        vec3 color = baseColor * (ambient + diffuse);
        color = clamp(color, 0.0, 1.0);
        gl_FragColor = vec4(color, 1.0);
    }
`;

export let floorVSText = `
    precision mediump float;

    attribute vec4 vertPosition;
    attribute vec4 aNorm;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 worldPos;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        worldPos = mWorld * vertPosition;
        gl_Position = mProj * mView * worldPos;
        lightDir = lightPosition - worldPos;
        // transform normal into world space to match cube pipeline
        normal = mWorld * aNorm;
    }
`;

export let floorFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 worldPos;

    void main () {
        vec3 n = normalize(normal.xyz);
        vec3 l = normalize(lightDir.xyz);
        float diffuse = max(dot(n, l), 0.0);

        float cellSize = 5.0;
        float cx = floor(worldPos.x / cellSize);
        float cz = floor(worldPos.z / cellSize);
        // ensure a non-negative parity before mod to avoid negative remainder issues
        float parity = mod(cx + cz + 10000.0, 2.0);
        // parity will be 0.0 or 1.0 -> pick black or white
        vec3 baseColor = (parity < 0.5) ? vec3(0.0) : vec3(1.0);

        float ambient = 0.01;
        vec3 color = baseColor * (ambient + diffuse);
        gl_FragColor = vec4(color, 1.0);
    }
`;