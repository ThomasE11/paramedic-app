import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type * as THREE from 'three';

test('pilot blinks with physical lids while retaining the eyes behind them', async ({ page }, info) => {
  test.setTimeout(90000);
  await page.setViewportSize({width:1440,height:1000});
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled','false'));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => page.evaluate(() => !!window.__r3f?.get().scene.getObjectByName('PilotEyelids')),{timeout:30000}).toBe(true);
  await page.getByRole('button',{name:'Examine Face',exact:true}).click();
  await page.waitForTimeout(800);
  await page.screenshot({path:info.outputPath('face-before-blink.png')});
  const result = await page.evaluate(async () => {
    const state=window.__r3f!.get();
    const lids=state.scene.getObjectByName('PilotEyelids') as THREE.SkinnedMesh;
    const body=state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    const left=state.scene.getObjectByName('eyeL')!, right=state.scene.getObjectByName('eyeR')!;
    const target=lids.morphTargetDictionary!.eyelids_closed;
    const samples: Array<{time:number,closure:number,eyesVisible:boolean}>=[];
    const captures: Record<string,string>={};
    const mountedFrames: Record<string,unknown>={};
    const coverage: Record<string,{closure:number,covered:number,total:number,rays:Array<{eye:string,x:number,y:number,covered:boolean,faceOccluded:boolean,irisHit:boolean}>}>={};
    const start=performance.now();
    await new Promise<void>(resolve => {
      const sample=()=>{
        const closure=lids.morphTargetInfluences![target];
        samples.push({time:performance.now()-start,closure,eyesVisible:left.visible&&right.visible});
        // The final 2% is still moving skin, not a sealed aperture. Sample
        // the blink's fully closed hold rather than an almost-closed frame.
        const label=closure>=1-1e-8?'closed':closure>.3&&closure<.7?'partial':closure<.01?'open':null;
        if(label&&!captures[label]) {
          state.gl.render(state.scene,state.camera);
          const mountedLids=state.scene.getObjectByName('PilotEyelids') as THREE.SkinnedMesh;
          mountedFrames[label]={sameLids:mountedLids===lids,sameBody:state.scene.getObjectByName('Patient')===body,
            before:closure,after:lids.morphTargetInfluences![target],mountedClosure:mountedLids.morphTargetInfluences![mountedLids.morphTargetDictionary!.eyelids_closed]};
          captures[label]=state.gl.domElement.toDataURL('image/png');
          // Three caches SkinnedMesh bounds; refresh after pose/morph changes
          // or a valid ray can be rejected against the old neutral-pose sphere.
          lids.computeBoundingSphere();
          lids.computeBoundingBox();
          body.computeBoundingSphere();
          body.computeBoundingBox();
          const Raycaster=state.raycaster.constructor as typeof THREE.Raycaster;
          const ray=new Raycaster();
          let covered=0,total=0;
          const rays:Array<{eye:string,x:number,y:number,covered:boolean,faceOccluded:boolean,irisHit:boolean}>=[];
          for(const name of ['irisL','irisR']) for(const x of [-.004,0,.004]) for(const y of [-.0015,0,.0015]) {
            const iris=state.scene.getObjectByName(name)!;
            const target=iris.localToWorld(state.camera.position.clone().set(x,y,0));
            ray.set(state.camera.position,target.sub(state.camera.position).normalize());
            const irisHits: THREE.Intersection[]=[];
            Object.getPrototypeOf(iris).raycast.call(iris,ray,irisHits);
            const irisDistance=Math.min(...irisHits.map(hit=>hit.distance));
            const hits: THREE.Intersection[]=[];
            // The production attachment deliberately ignores assessment clicks.
            // Exercise the real skinned mesh raycast for geometric occlusion.
            Object.getPrototypeOf(lids).raycast.call(lids,ray,hits);
            const bodyHits: THREE.Intersection[]=[];
            Object.getPrototypeOf(body).raycast.call(body,ray,bodyHits);
            const faceOccluded=bodyHits.some(hit=>hit.distance<irisDistance);
            const occluded=hits.some(hit=>hit.distance<irisDistance);
            if(occluded) covered++;
            rays.push({eye:name,x,y,covered:occluded,faceOccluded,irisHit:Number.isFinite(irisDistance)});
            total++;
          }
          coverage[label]={closure,covered,total,rays};
        }
        if(performance.now()-start>=12000) resolve();else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    state.gl.render(state.scene,state.camera);
    const morphSyncError=Math.max(...Object.entries(body.morphTargetDictionary!).map(([name,index])=>Math.abs(
      body.morphTargetInfluences![index]-lids.morphTargetInfluences![lids.morphTargetDictionary![name]])));
    const uv=lids.geometry.getAttribute('uv');
    const indices=lids.geometry.index!;
    let minUvArea=Infinity;
    for(let i=0;i<indices.count;i+=3) {
      const a=indices.getX(i),b=indices.getX(i+1),c=indices.getX(i+2);
      minUvArea=Math.min(minUvArea,Math.abs((uv.getX(b)-uv.getX(a))*(uv.getY(c)-uv.getY(a))
        -(uv.getY(b)-uv.getY(a))*(uv.getX(c)-uv.getX(a)))*.5);
    }
    return {samples,captures,coverage,mountedFrames,morphSyncError,minUvArea,skinned:lids.isSkinnedMesh,sameSkeleton:lids.skeleton===body.skeleton,
      vertices:lids.geometry.getAttribute('position').count,
      morphs:Object.keys(lids.morphTargetDictionary!),bodyMorphs:Object.keys(body.morphTargetDictionary!)};
  });
  for(const [name,data] of Object.entries(result.captures)) await writeFile(info.outputPath(`blink-${name}.png`),Buffer.from(data.split(',')[1],'base64'));
  const {captures: _captures,...evidence}=result;
  await writeFile(info.outputPath('blink-samples.json'),JSON.stringify(evidence,null,2));
  expect(result.skinned).toBe(true);expect(result.sameSkeleton).toBe(true);
  expect(result.vertices).toBeGreaterThan(100);expect(result.vertices).toBeLessThan(5000);
  expect(result.morphs).toEqual(expect.arrayContaining(result.bodyMorphs));
  expect(result.morphSyncError).toBeLessThan(1e-6);
  // Collapsed UV rows produced dark vertical texture stripes on closed lids.
  expect(result.minUvArea).toBeGreaterThan(1e-12);
  expect(result.samples.every(sample=>sample.eyesVisible)).toBe(true);
  expect(result.samples.some(sample=>sample.closure>=1-1e-8)).toBe(true);
  expect(result.samples.some(sample=>sample.closure>.3&&sample.closure<.7)).toBe(true);
  expect(result.samples.filter(sample=>sample.closure<.01).length).toBeGreaterThan(result.samples.length*.7);
  expect(Object.keys(result.captures).sort()).toEqual(['closed','open','partial']);
  expect(Object.values(result.coverage).every(frame=>frame.rays.every(ray=>ray.irisHit))).toBe(true);
  // Natural lids can overlap the iris rim. The pupil centres must remain
  // visible at rest; closing must hide every sampled part of the aperture.
  // Some peripheral iris points are already behind the surrounding face.
  const centres=result.coverage.open.rays.filter(ray=>ray.x===0&&ray.y===0);
  expect(centres).toHaveLength(2);
  expect(centres.every(ray=>!ray.covered&&!ray.faceOccluded)).toBe(true);
  expect(result.coverage.open.covered).toBeLessThan(result.coverage.open.total*.25);
  expect(result.coverage.closed.rays.every(ray=>ray.covered||ray.faceOccluded)).toBe(true);
  expect(result.coverage.closed.closure).toBeCloseTo(1, 8);
});

test('non-pilot patients retain the shared eye path without loading the lid asset', async ({ page }) => {
  const requests:string[]=[];
  page.on('request',request=>requests.push(request.url()));
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled','false'));
  await page.goto('/?devLiveCase=resp-003');
  await expect.poll(()=>page.evaluate(()=>!!window.__r3f?.get().scene.getObjectByName('eyeL')),{timeout:30000}).toBe(true);
  expect(await page.evaluate(()=>!!window.__r3f!.get().scene.getObjectByName('PilotEyelids'))).toBe(false);
  expect(requests.some(url=>url.includes('resp001-eyelids.glb'))).toBe(false);
});
