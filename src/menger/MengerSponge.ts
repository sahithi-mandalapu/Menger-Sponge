import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IMengerSponge {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents a Menger Sponge
 */
export class MengerSponge implements IMengerSponge {

  // data kept for the current sponge
  private level: number = 1;
  private dirty: boolean = true;
  private positions: number[] = [];
  private normals: number[] = [];
  private indices: number[] = [];

  constructor(level: number) {
      this.setLevel(level);
      // nothing else to do here
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
       return this.dirty;
  }

  public setClean(): void {
      this.dirty = false;
  }
  
  public setLevel(level: number)
  {
      if (level < 1) {
          level = 1;
      }
      if (level === this.level && !this.dirty) {
          // nothing to do
          return;
      }
      this.level = level;
      this.generateGeometry();
      this.dirty = true;
  }

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
      return new Float32Array(this.positions);
  }

  /**
   * helper that appends a single axis-aligned cube to the internal arrays.
   * Coordinates are inclusive min, max in world space.  We create 24
   * distinct vertices (4 per face) so that normals may be flat.
   */
  private appendCube(
      minx: number,
      miny: number,
      minz: number,
      maxx: number,
      maxy: number,
      maxz: number
  ) {
      const baseIndex = this.positions.length / 4; // 4 components per position

      // face definitions: each entry contains an array of four vertex coords
      // and a normal vector [nx, ny, nz].  The order of vertices is chosen
      // so that when looking at the face from outside the cube the triangle
      // winding is counter–clockwise.
      const faces = [
          // +X
          {
              verts: [
                  [maxx, miny, minz],
                  [maxx, miny, maxz],
                  [maxx, maxy, maxz],
                  [maxx, maxy, minz]
              ],
              norm: [1, 0, 0]
          },
          // -X
          {
              verts: [
                  [minx, miny, maxz],
                  [minx, miny, minz],
                  [minx, maxy, minz],
                  [minx, maxy, maxz]
              ],
              norm: [-1, 0, 0]
          },
          // +Y
          {
              verts: [
                  [minx, maxy, minz],
                  [maxx, maxy, minz],
                  [maxx, maxy, maxz],
                  [minx, maxy, maxz]
              ],
              norm: [0, 1, 0]
          },
          // -Y
          {
              verts: [
                  [minx, miny, maxz],
                  [maxx, miny, maxz],
                  [maxx, miny, minz],
                  [minx, miny, minz]
              ],
              norm: [0, -1, 0]
          },
          // +Z
          {
              verts: [
                  [minx, miny, maxz],
                  [minx, maxy, maxz],
                  [maxx, maxy, maxz],
                  [maxx, miny, maxz]
              ],
              norm: [0, 0, 1]
          },
          // -Z
          {
              verts: [
                  [maxx, miny, minz],
                  [maxx, maxy, minz],
                  [minx, maxy, minz],
                  [minx, miny, minz]
              ],
              norm: [0, 0, -1]
          }
      ];

      for (const face of faces) {
          const start = this.positions.length / 4;
          // push 4 verts with w=1
          for (const v of face.verts) {
              this.positions.push(v[0], v[1], v[2], 1.0);
              this.normals.push(face.norm[0], face.norm[1], face.norm[2], 0.0);
          }
          // two triangles: 0-1-2 and 0-2-3
          this.indices.push(start, start + 1, start + 2);
          this.indices.push(start, start + 2, start + 3);
      }
  }

  /**
   * regenerate the geometry for the current level of the sponge.
   */
  private generateGeometry() {
      this.positions = [];
      this.normals = [];
      this.indices = [];

      console.log("Generating level", this.level);

      // start with a single cube spanning [-0.5,0.5] in each axis
      type Cube = { minx: number; miny: number; minz: number; maxx: number; maxy: number; maxz: number };
      let cubes: Cube[] = [
          { minx: -0.5, miny: -0.5, minz: -0.5, maxx: 0.5, maxy: 0.5, maxz: 0.5 }
      ];

      for (let lvl = 2; lvl <= this.level; lvl++) {
          const next: Cube[] = [];
          
          console.log("Cube count:", cubes.length);

          for (const c of cubes) {
              const dx = (c.maxx - c.minx) / 3.0;
              const dy = (c.maxy - c.miny) / 3.0;
              const dz = (c.maxz - c.minz) / 3.0;
              for (let i = 0; i < 3; i++) {
                  for (let j = 0; j < 3; j++) {
                      for (let k = 0; k < 3; k++) {
                          // removal rule: drop cubes where any two of the
                          // indices are equal to 1 (center cross)
                          if ((i === 1 && j === 1) || (i === 1 && k === 1) || (j === 1 && k === 1)) {
                              continue;
                          }
                          next.push({
                              minx: c.minx + i * dx,
                              miny: c.miny + j * dy,
                              minz: c.minz + k * dz,
                              maxx: c.minx + (i + 1) * dx,
                              maxy: c.miny + (j + 1) * dy,
                              maxz: c.minz + (k + 1) * dz
                          });
                      }
                  }
              }
          }
          cubes = next;
      }

      // now convert cube list to triangles
      for (const c of cubes) {
          this.appendCube(c.minx, c.miny, c.minz, c.maxx, c.maxy, c.maxz);
      }
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // the indices have already been generated in setLevel
    return new Uint32Array(this.indices);
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
      return new Float32Array(this.normals);
  }

  /**
   * Returns the model matrix of the sponge
   */
  public uMatrix(): Mat4 {

    // TODO: change this, if it's useful
    const ret : Mat4 = new Mat4().setIdentity();

    return ret;    
  }
  
}
