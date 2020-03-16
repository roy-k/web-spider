import { SiOptions } from "../../types";
import { getFieldsFromPageData } from "../../src/modules/readPageData";

const pageString = `<!DOCTYPE html>
    <html lang="zh-CN">
    <head> </head>
    <body id="top" class="archive category category-meitu category-65">
        <div class="post-listing archive-box">
            <article class="item-list">
                <h2 class="post-box-title">
                    <a href="http://acg.com/50255.html">日本画师れおえん的插画作品</a>
                </h2>
                <p class="post-meta">
                    <span class="post-views">1,637 </span>
                </p>
            </article>
        </div>
    </body>
</html>
`;
const option: SiOptions = {
  selector: ".item-list",
  fields: {
    key: {
      selector: ".post-box-title a",
      selectorProps: {
        type: "prop",
        name: "href",
      },
    },
    title: {
      selector: ".post-box-title a",
    },
    views: {
      selector: ".post-meta .post-views",
      selectorProps: {
        formatter: (text: string) => text.trim(),
      },
    },
  },
};
test("getFieldsFromPageData", async () => {
  const data = await getFieldsFromPageData(pageString, option);
  expect(data && data.list.length).toBe(1);

  const first = data && data.list[0];

  expect(first.key).toMatch(/.+/);
  expect(first.title).toMatch(/.+/);
  expect(first.views).toMatch(/.+/);
});
