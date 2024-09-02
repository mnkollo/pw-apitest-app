import { test as setup} from '@playwright/test';
import user from '../.auth/user.json';
import fs from 'fs'

const authFile = '.auth/user.json';

setup('authentication', async ({page,request}) => {
    // await page.goto('https://conduit.bondaracademy.com/');
    // await page.getByText('Sign in').click();
    // await page.getByRole('textbox', {name: 'Email'}).fill('mnkollo23@mailinator.com')
    // await page.getByRole('textbox', {name: 'Password'}).fill('Welcome!1')
    // await page.getByRole('button', {name: 'Sign in'}).click()

    // await page.waitForResponse('*/**/api/tags') //so when we see this api endpoint we know 

    // await page.context().storageState({path: authFile})  // before this run we have to make sure we are logged in, saves the authenticated state

    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user": { "email": "mnkollo23@mailinator.com", "password": "Welcome!1" }
        }
      })
      const responseBody = await response.json()
      const accessToken = responseBody.user.token
      user.origins[0].localStorage[0].value = accessToken
      fs.writeFileSync(authFile, JSON.stringify(user))

      process.env['ACCESS_TOKEN'] = accessToken
})