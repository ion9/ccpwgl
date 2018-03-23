import {vec3} from '../../math';
import {resMan} from '../global/Tw2ResMan';
import {Tw2RenderBatch} from '../batch';
import {Tw2Mesh} from './Tw2Mesh';

/**
 * Tw2InstancedMesh
 * @property instanceGeometryResource
 * @property {string} instanceGeometryResPath
 * @property {number} instanceMeshIndex
 * @property {vec3} minBounds
 * @property {vec3} maxBounds
 * @inherit Tw2Mesh
 * @constructor
 */
export class Tw2InstancedMesh extends Tw2Mesh
{
    constructor()
    {
        super();
        this.instanceGeometryResource = null;
        this.instanceGeometryResPath = '';
        this.instanceMeshIndex = 0;
        this.minBounds = vec3.create();
        this.maxBounds = vec3.create();
    }

    /**
     * Initializes the Tw2InstancedMesh
     * @prototype
     */
    Initialize()
    {
        super.Initialize();
        if (this.instanceGeometryResPath !== '')
        {
            this.instanceGeometryResource = resMan.GetResource(this.instanceGeometryResPath);
        }
    }
}

/**
 * _GetAreaBatches
 * @param {Array.<Tw2MeshArea>} areas
 * @param {number} mode
 * @param {Tw2BatchAccumulator} accumulator
 * @param {Tw2PerObjectData} perObjectData
 * @private
 */
Tw2InstancedMesh.prototype._GetAreaBatches = function(areas, mode, accumulator, perObjectData)
{
    for (var i = 0; i < areas.length; ++i)
    {
        var area = areas[i];
        if (area.effect === null || area.debugIsHidden)
        {
            continue;
        }
        var batch = new Tw2InstancedMeshBatch();
        batch.renderMode = mode;
        batch.perObjectData = perObjectData;
        batch.instanceMesh = this;
        batch.meshIx = area.meshIndex;
        batch.start = area.index;
        batch.count = area.count;
        batch.effect = area.effect;
        accumulator.Commit(batch);
    }
};

/**
 * RenderAreas
 * @param {number} meshIx
 * @param {number} start
 * @param {number} count
 * @param {Tw2Effect} effect
 * @prototype
 */
Tw2InstancedMesh.prototype.RenderAreas = function(meshIx, start, count, effect)
{
    if (this.geometryResource)
    {
        this.geometryResource.KeepAlive();
    }
    if (this.instanceGeometryResource && this.instanceGeometryResource.KeepAlive)
    {
        this.instanceGeometryResource.KeepAlive();
    }
    if (this.geometryResource && this.instanceGeometryResource)
    {
        if (!this.geometryResource.IsGood())
        {
            return;
        }
        var buffer = this.instanceGeometryResource.GetInstanceBuffer(this.instanceMeshIndex);
        if (buffer)
        {
            this.geometryResource.RenderAreasInstanced(meshIx, start, count, effect,
                buffer,
                this.instanceGeometryResource.GetInstanceDeclaration(this.instanceMeshIndex),
                this.instanceGeometryResource.GetInstanceStride(this.instanceMeshIndex),
                this.instanceGeometryResource.GetInstanceCount(this.instanceMeshIndex));
        }
    }
};


/**
 * Tw2InstancedMeshBatch
 * @property {Tw2InstancedMesh} instanceMesh
 * @property {Tw2GeometryRes} geometryRes
 * @property {number} meshIx
 * @property {number} start
 * @property {number} count
 * @property {Tw2Effect|null} effect
 * @inherit Tw2RenderBatch
 * @class
 */
export class Tw2InstancedMeshBatch extends Tw2RenderBatch
{
    constructor()
    {
        super();
        this.instanceMesh = null;
        this.geometryRes = null;
        this.meshIx = 0;
        this.start = 0;
        this.count = 1;
        this.effect = null;
    }
}

/**
 * Commits the Tw2InstancedMeshBatch for rendering
 * @param {Tw2Effect} [overrideEffect]
 * @prototype
 */
Tw2InstancedMeshBatch.prototype.Commit = function(overrideEffect)
{
    var effect = typeof(overrideEffect) === 'undefined' ? this.effect : overrideEffect;
    if (this.instanceMesh && effect)
    {
        this.instanceMesh.RenderAreas(this.meshIx, this.start, this.count, effect);
    }
};