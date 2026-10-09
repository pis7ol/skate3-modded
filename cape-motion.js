export function installCapeMotion(character){
 if(character?.id!=='mandalorian'||!globalThis.GPUDevice)return;
 const create=GPUDevice.prototype.createShaderModule;
 GPUDevice.prototype.createShaderModule=function(descriptor){
  let code=descriptor.code;
  const view=code.match(/var<uniform> (view\w*):/)?.[1];
  if(view) code=code.replace(/fn skin_(?:prev_)?model\w*\([^)]*\)\s*->\s*mat4x4<f32>\s*\{[\s\S]*?\n\}/g,fn=>fn.replace('indexes: vec4','cloth_indexes: vec4').replace('{', '{ let indexes = vec4<u32>(select(cloth_indexes.x, 4u, cloth_indexes.x == 31u), select(cloth_indexes.y, 4u, cloth_indexes.y == 31u), select(cloth_indexes.z, 4u, cloth_indexes.z == 31u), select(cloth_indexes.w, 4u, cloth_indexes.w == 31u));').replace(/return ([^;]+);/,`let cape_matrix = $1;
    let cape_weight = select(0.0, weights.x, cloth_indexes.x == 31u) + select(0.0, weights.y, cloth_indexes.y == 31u) + select(0.0, weights.z, cloth_indexes.z == 31u) + select(0.0, weights.w, cloth_indexes.w == 31u);
    let cape_phase = f32(${view}.frame_count) * 0.07;
    let cape_offset = cape_weight * (cape_matrix[2].xyz * (0.07 * sin(cape_phase)) + cape_matrix[0].xyz * (0.025 * sin(cape_phase * 0.71)));
    return mat4x4<f32>(cape_matrix[0], cape_matrix[1], cape_matrix[2], vec4<f32>(cape_matrix[3].xyz + cape_offset, cape_matrix[3].w));`));
  return create.call(this,{...descriptor,code});
 };
}
