import { test, expect, type Page } from '@playwright/test';
import type * as THREE from 'three';
import { writeFile } from 'node:fs/promises';

test.use({ viewport: { width: 1440, height: 960 } });

async function inspectStrap(page: Page, mode: string) {
  return page.evaluate(mode => {
    const state = window.__r3f!.get();
    const strap = state.scene.getObjectByName('pilot-mask-elastic-strap') as THREE.Mesh;
    const shell = state.scene.getObjectByName(`${mode}-contoured-shell`) as THREE.Mesh;
    const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    const frame = state.scene.getObjectByName('PatientFaceAttachment')!;
    if (!strap || !shell || !body || !frame) return null;
    state.scene.updateMatrixWorld(true); body.skeleton.update();
    const p = strap.geometry.getAttribute('position');
    const ring = (i: number) => {
      const centre = state.camera.position.clone().set(0, 0, 0);
      for (let j=0;j<4;j++) centre.add(state.camera.position.clone().fromBufferAttribute(p, i*4+j));
      return strap.localToWorld(centre.multiplyScalar(.25));
    };
    const mask = shell.geometry.getAttribute('position');
    const rim = Array.from({length:48}, (_,i) => state.camera.position.clone().fromBufferAttribute(mask,i));
    const left = rim.reduce((a,b) => a.x<b.x?a:b), right = rim.reduce((a,b) => a.x>b.x?a:b);
    const errors = [ring(0).distanceTo(shell.localToWorld(left)), ring(32).distanceTo(shell.localToWorld(right))];
    const Raycaster = state.raycaster.constructor as typeof THREE.Raycaster;
    const ray = new Raycaster();
    const centre = frame.localToWorld(state.camera.position.clone().set(0,1.665,-.09));
    const clearances = [];
    for(let i=3;i<30;i++) {
      const contact = ring(i);
      const local = frame.worldToLocal(contact.clone());
      if(local.z>-.04) continue;
      const outward = contact.clone().sub(centre).normalize();
      ray.set(contact.clone().addScaledVector(outward,.2),outward.negate());
      const hit = ray.intersectObject(body,false)[0];
      clearances.push({ring:i, local:local.toArray(), gap:hit ? hit.distance-.2 : null});
    }
    return {errors, clearances, rear: frame.worldToLocal(ring(16)).toArray(), count:p.count,
      gasp:body.morphTargetInfluences?.[body.morphTargetDictionary?.motion_gasp ?? -1] ?? 0};
  }, mode);
}

test('pilot elastic follows both masks and wraps outside the moving head', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled','false'));
  await page.goto('/?devLiveCase=resp-001');
  for(const mode of ['nonrebreather','nebulizer'] as const) {
    await page.getByRole('tab',{name:'Treat',exact:true}).click();
    await page.getByRole('button',{name:mode==='nonrebreather'?'Select Non-rebreather':'Select Nebuliser Mask',exact:true}).click();
    const dialog = page.getByRole('dialog',{name:mode==='nonrebreather'?/Apply non-rebreather mask/i:'Apply nebuliser mask'});
    const steps = mode==='nonrebreather'
      ? ['Connect oxygen tubing','Pre-inflate reservoir','Seat the mask','Set prescribed flow','Confirm response']
      : ['Assemble and connect','Explain and coach','Fit the mask','Start aerosol flow','Reassess response'];
    for(const step of steps) await dialog.getByRole('button',{name:`Perform: ${step}`,exact:true}).click();
    await dialog.getByRole('button',{name:mode==='nonrebreather'?/Oxygen running — reassess SpO₂/i:'Aerosol flowing — reassess wheeze'}).click();
    await expect.poll(() => inspectStrap(page,mode),{timeout:30000}).not.toBeNull();
    // Cover several breaths and irregular effort movements, not just the
    // initial frozen fitting frame. Retain all samples, including any gasps.
    for(let sample=0;sample<24;sample++) {
      const result = (await inspectStrap(page,mode))!;
      await writeFile(info.outputPath(`${mode}-fit-${sample}.json`),JSON.stringify(result,null,2));
      await info.attach(`${mode}-fit-${sample}.json`,{body:JSON.stringify(result,null,2),contentType:'application/json'});
      expect(result.count).toBe(132);
      expect(Math.max(...result.errors)).toBeLessThan(.001);
      expect(result.rear[2]).toBeLessThan(-.185);
      expect(result.clearances.length).toBeGreaterThan(15);
      for(const contact of result.clearances) {
        expect(contact.gap,`skin hit at ring ${contact.ring}`).not.toBeNull();
        expect(contact.gap,`penetration at ring ${contact.ring}`).toBeGreaterThan(-.001);
        expect(contact.gap,`floating at ring ${contact.ring}`).toBeLessThan(.025);
      }
      await page.waitForTimeout(500);
    }
    await page.getByRole('tab',{name:'Assess',exact:true}).click();
    await page.getByRole('button',{name:'Examine Face',exact:true}).click();
    await page.waitForTimeout(800);
    await page.screenshot({path:info.outputPath(`${mode}-front.png`)});
    await page.getByRole('button',{name:'Back to full body',exact:true}).click();
    await page.waitForTimeout(800);
    const canvas = page.locator('.patient-model-canvas-stage canvas');
    const {x,y} = await canvas.evaluate(canvas => {
      const box=canvas.getBoundingClientRect();
      for(const fy of [.4,.6,.3,.7]) for(const fx of [.15,.85,.25,.75]) {
        const x=box.x+box.width*fx,y=box.y+box.height*fy;
        if(document.elementFromPoint(x,y)===canvas) return {x,y};
      }
      throw new Error('No unobstructed orbit point');
    });
    for(const [label,delta] of [['left',180],['right',-360]] as const) {
      const before = await page.evaluate(() => window.__r3f!.get().controls!.getAzimuthalAngle());
      await page.mouse.move(x,y);await page.mouse.down();
      await page.mouse.move(x+delta,y,{steps:20});await page.mouse.up();
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => window.__r3f!.get().controls!.getAzimuthalAngle());
      expect(Math.abs(after-before)).toBeGreaterThan(.1);
      await page.screenshot({path:info.outputPath(`${mode}-${label}.png`)});
    }
    // Diagnostic rear close-up supplements, but does not replace, normal UI
    // orbits above. It exposes the occipital band otherwise hidden by the head.
    const original = await page.evaluate(() => {
      const state=window.__r3f!.get(), frame=state.scene.getObjectByName('PatientFaceAttachment')!;
      const controls=state.controls!;
      const original={position:state.camera.position.toArray(),target:controls.target.toArray(),
        minDistance:controls.minDistance,maxDistance:controls.maxDistance,
        minAzimuthAngle:controls.minAzimuthAngle,maxAzimuthAngle:controls.maxAzimuthAngle,
        minPolarAngle:controls.minPolarAngle,maxPolarAngle:controls.maxPolarAngle};
      controls.minDistance=.1;controls.maxDistance=10;
      controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;
      controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI;
      const target=frame.localToWorld(state.camera.position.clone().set(0,1.66,-.10));
      const position=frame.localToWorld(state.camera.position.clone().set(.30,1.76,-.65));
      state.camera.position.copy(position);state.controls!.target.copy(target);state.controls!.update();
      return original;
    });
    await page.waitForTimeout(300);
    await page.screenshot({path:info.outputPath(`${mode}-rear-diagnostic.png`)});
    await page.evaluate(original => {
      const state=window.__r3f!.get();
      Object.assign(state.controls!,{
        minDistance:original.minDistance,maxDistance:original.maxDistance,
        minAzimuthAngle:original.minAzimuthAngle,maxAzimuthAngle:original.maxAzimuthAngle,
        minPolarAngle:original.minPolarAngle,maxPolarAngle:original.maxPolarAngle,
      });
      state.camera.position.fromArray(original.position);state.controls!.target.fromArray(original.target);state.controls!.update();
    },original);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});
