#"C:\Program Files\Blender Foundation\Blender\blender" -b cube.blend -P convetBlendToJSON.py

import bpy
import bmesh
import json
from json import JSONEncoder
import mathutils
import math
import sys
import copy

class AnimationKeypoint:
    def __init__(self):
        self.time = 0
        self.position = [0, 0, 0]
        self.rotation = [0, 0, 0, 1]
        self.scale = [1, 1, 1]
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)

class Animation:
    def __init__(self):
        self.name = ""
        self.repeat = False
        self.duration = 0
        self.bones = []
        self.markers = []
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)

class Bone:
    def __init__(self):
        self.name = ""
        self.parent = ""
        self.position = [0, 0, 0]
        self.positionWorld = [0, 0, 0]
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)

class BoneReference:
    def __init__(self):
        self.index = 0
        self.weight = 0
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)

class Vertex:
    def __init__(self):
        self.position = [0, 0, 0]
        self.normal = [0, 0, 0]
        self.bones = [BoneReference(), BoneReference()]
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)

class UV:
    def __init__(self):
        self.x = 0
        self.y = 0
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)
        
class Face:
    def __init__(self):
        self.vertexIndex = [0, 0, 0]
        self.uvs = [UV(), UV(), UV()]
        self.normal = [0, 0, 1]
        self.materialIndex = 0
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)
        
class Model:
    def __init__(self):
        self.vertices = []
        self.faces = []
        self.bones = []
        self.materials = []
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)

def run(filepath):
    vertices = []
    faces = []
    bones = []

    for obj in bpy.data.objects:
        if obj.type == "MESH":
            #convert all quads to tris
            bpy.ops.object.select_all(action='DESELECT')
            obj.select = True
            bpy.context.scene.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')  # Convert to Triangles
            bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.object.modifier_apply(modifier="Mirror")
            
            rotation_matrix = mathutils.Matrix.Rotation(math.radians(-90.0), 4, 'X')
            
            vertexOffset = len(vertices)

            #fetch all vertices
            vertexData = obj.data.vertices
            #convert out the data we need
            for v in vertexData:
                vertex = Vertex()
                tup = (obj.matrix_world * rotation_matrix * v.co).to_tuple()
                vertex.position = [tup[0], tup[1], tup[2]]
                tup = (obj.matrix_world * rotation_matrix * v.normal).to_tuple()
                vertex.normal = [tup[0], tup[1], tup[2]]
                vertex.bones = []
                for i in range(2):#allow only 2 bones per vertex
                    bone = BoneReference()
                    if i < len(v.groups):
                        bone.index = v.groups[i].group
                        bone.weight = v.groups[i].weight
                    vertex.bones.append(bone)
                vertices.append(vertex)

            #make a mesh object from this object
            bm = bmesh.new()
            bm.from_mesh(obj.data)
            bm.faces.ensure_lookup_table()
            uv_layer = bm.loops.layers.uv.verify()
            #copy the face data we need
            for f in bm.faces:
                face = Face()
                face.vertexIndex = []
                for v in f.verts:
                    face.vertexIndex.append(v.index + vertexOffset)
                face.uvs = []
                for loop in f.loops:
                    tup = loop[uv_layer].uv
                    face.uvs.append([tup[0], tup[1]])
                n = rotation_matrix * f.normal;
                face.normal = [n[0], n[2], n[1]]
                face.materialIndex = f.material_index
                faces.append(face)
        elif obj.type == "ARMATURE":         
            boneData = obj.data.bones
            for b in boneData:
                bone = Bone()
                bone.name = b.name
                if b.parent is None:
                    bone.parent = ""
                    bone.position = [b.head_local[0], b.head_local[2], b.head_local[1]]   
                    bone.positionWorld = copy.copy(bone.position)
                else:
                    bone.parent = b.parent.name
                    bone.position = [b.head_local[0] - b.parent.head_local[0], b.head_local[2] - b.parent.head_local[2], b.head_local[1] - b.parent.head_local[1]]
                    bone.positionWorld = copy.copy(bone.position)
                    parent = b.parent
                    while parent.parent is not None:
                        bone.positionWorld[0] += (parent.head_local[0] - parent.parent.head_local[0])
                        bone.positionWorld[1] += (parent.head_local[2] - parent.parent.head_local[2])
                        bone.positionWorld[2] += (parent.head_local[1] - parent.parent.head_local[1])
                        parent = parent.parent
                bones.append(bone)

    #Animations
    animations = []
    for act in bpy.data.actions:
        animation = Animation()
        lastKeyframeTime = 0
        for curve in act.fcurves:
            for keyframe in curve.keyframe_points:
                if keyframe.co[0] > lastKeyframeTime:
                    lastKeyframeTime = keyframe.co[0]
        lastKeyframeTime = round(lastKeyframeTime) + 1
        animation.duration = lastKeyframeTime
        
        animation.bones = []
        for b in bones:
            animBone = []
            for time in range(0, lastKeyframeTime):
                animBone.append(AnimationKeypoint())
            animation.bones.append(animBone)

        curveID = 0 #0-2 position, 3-6 quat, 7-9 scale
        for curve in act.fcurves:
            valueIndex = curve.array_index

            firstQ = curve.data_path.find('"')+1
            secondQ = curve.data_path.find('"', firstQ)
            boneName = curve.data_path[firstQ:secondQ]

            firstQ = curve.data_path.rfind('.')+1
            valueType = curve.data_path[firstQ:]

            boneIndex = 0
            index = 0
            for b in bones:
                if boneName == b.name:
                    boneIndex = index
                index += 1
            
            #print(boneName +" "+ str(boneIndex) + " " + valueType + " " + str(valueIndex))

            for time in range(0, lastKeyframeTime):
                value = curve.evaluate(time)
                animation.bones[boneIndex][time].time = time
                if valueType == "location":
                    if valueIndex == 0:
                        animation.bones[boneIndex][time].position[0] = value
                    elif valueIndex == 1:
                        animation.bones[boneIndex][time].position[1] = value
                    elif valueIndex == 2:
                        animation.bones[boneIndex][time].position[2] = value
                elif valueType == "rotation_quaternion":
                    if valueIndex == 0:
                        animation.bones[boneIndex][time].rotation[3] = value
                    elif valueIndex == 1:
                        animation.bones[boneIndex][time].rotation[0] = value
                    elif valueIndex == 2:
                        animation.bones[boneIndex][time].rotation[1] = value
                    elif valueIndex == 3:
                        animation.bones[boneIndex][time].rotation[2] = value
                elif valueType == "scale":
                    if valueIndex == 0:
                        animation.bones[boneIndex][time].scale[0] = value
                    elif valueIndex == 1:
                        animation.bones[boneIndex][time].scale[1] = value
                    elif valueIndex == 2:
                        animation.bones[boneIndex][time].scale[2] = value  
        animations.append(animation)
        
    #write to JSON file
    model = Model()
    model.vertices = vertices;
    model.faces = faces; 
    model.bones = bones;
    model.animations = animations;

    #print(model.toJson())
    
    with open(filepath, 'w') as file:
        file.write(model.toJson())

run("mech.json")