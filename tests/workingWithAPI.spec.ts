import { test, expect} from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/');

});
test('test 1', async ({ page }) => {
  await page.route('*/**/api/articles?limit=10&offset=0', async (route) => {
    const response = await route.fetch()                                                      //complete the api call and return/
    const responseBody = await response.json()                                                //parse the response body          
    responseBody.articles[0].title = 'This is a Mock test title'                              //modify the response body  
    responseBody.articles[0].description = 'This is a Mock test description'                  //modify the response body

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  });

  // verification through UI
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a Mock test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a Mock test description')
});

test('delete article', async ({ page, request }) => {
 
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      article: {
        title: "Lebron the goat",
        description: "Is Lebron the best Basketball player of all time?\",",
        body: "\"Michael Jordan is still the greatest of all time in the eyes of NBA players, but his lead over LeBron James is narrowing. On Monday, The Athletic released the results of its annual player poll, and 45.9 percent of the 133 players who responded regarding the GOAT question picked His Airness. That was followed by James at 42.1 percent and Kobe Bryant at 9.8 percent",
        tagList: []
      }
    },
  })
  const articleResponseBody = await articleResponse.json()
  console.log(articleResponseBody)
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('Lebron the goat').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

  //validation through UI
  await expect(page.locator('app-article-list h1').first()).not.toContainText('Lebron the goat')
})

test('create article and delete article through slug ID', async ({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'Article Title'}).fill('Playwright Rocks')
  await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('About the Playwright')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('We like to use playwright for automation')
  await page.getByRole('button', {name: 'Publish Article'}).click()

  // wait for api call to be completed
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json() //return response in json 
  const slugId = articleResponseBody.article.slug

  //Validate through UI
  await expect(page.locator('.article-page p')).toContainText('We like to use playwright for automation')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright Rocks')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
  })
  expect(deleteArticleResponse.status()).toEqual(204)
})
