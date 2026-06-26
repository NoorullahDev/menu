const fetch = require('node-fetch');

async function getWikipediaImage(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=1&prop=pageimages&format=json&pithumbsize=500&origin=*`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      if (pages.length > 0 && pages[0].thumbnail) {
        console.log("Image found for", query, ":", pages[0].thumbnail.source);
        return;
      }
    }
    console.log("No image found for", query);
  } catch (e) {
    console.log("Error:", e);
  }
}

async function test() {
  await getWikipediaImage("Cheeseburger");
  await getWikipediaImage("Chicken Tikka Masala");
  await getWikipediaImage("Orange Juice");
}

test();
