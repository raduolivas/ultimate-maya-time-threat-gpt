import { expect, test } from '@playwright/test';
test('renders the 3D scene and restores a saved journey',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('#game')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Begin in 1200 · The Lantern Age'}).click();
 await expect(page.locator('#status')).toContainText('1200');
 await page.getByRole('button',{name:'Inventory',exact:true}).click();
 await expect(page.locator('#dialog-body')).toContainText("Traveler's journal");
 await page.getByRole('button',{name:'Return to the world'}).click();
 await page.getByRole('button',{name:'Save',exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:'Continue saved journey'}).click();
 await expect(page.locator('#status')).toContainText('1200');
 await expect(page.locator('#dialog')).not.toBeVisible();
 expect(errors).toEqual([]);
});
test('a future start uses its own era and invalid saves are recoverable',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.setItem('ultimate-maya.save.v1','invalid'));
 await page.getByRole('button',{name:'Continue saved journey'}).click();
 await expect(page.getByRole('button',{name:'Begin in 2080 · A Possible Tomorrow'})).toBeVisible();
 await page.getByRole('button',{name:'Begin in 2080 · A Possible Tomorrow'}).click();
 await expect(page.locator('#status')).toContainText('2080');
 await expect(page.locator('#location')).toContainText('The Remembered City');
});
