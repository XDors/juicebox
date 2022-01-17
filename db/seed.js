const { 
    client,
    getAllUsers,
    createUser, 
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    createTags,
    addTagsToPost,
    getPostsByTagName
} = require('./index');

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
       `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables...");
        
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL, 
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
          );
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    }
}

async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia' });
      const sandra = await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: 'Aint tellin' });
      const glamgal = await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side' });
  
      console.log('USERS:', albert, sandra, glamgal);
  
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        const postOne = await createPost({ authorId: albert.id, title: 'Hello World', content: 'Isnt that the first thing folks always say?', tags: ["#happy", "#youcandoanything"]});
        const postTwo = await createPost({ authorId: sandra.id, title: 'Welcome Back', content: 'Just some more content', tags: ["#happy", "#worst-day-ever"] });
        const postThree = await createPost({ authorId: glamgal.id, title: 'Who Really Knows?', content: 'Lorem Ipsum somethin sumthin', tags: ["#happy", "#youcandoanything", "#canmandoeverything"] })

        console.log('POSTS:', postOne, postTwo, postThree);

    } catch(err) {
        throw err
    }
}

async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
}

async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
    } catch (error) {
      throw error;
    } 
}

async function testDB() {
    try {  
      console.log("Starting to test database...");
      const users = await getAllUsers()
  
      console.log("getAllUsers:", users);

      console.log("Calling updateUser on users[0]")
      
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });

      console.log("Result:", updateUserResult);
      
      const posts = await getAllPosts();
    
      console.log("getAllPost:", posts);

      console.log("Calling updatePost on posts[1], only updating tags");
    
      const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result:", updatePostTagsResult);

      console.log("Calling getPostsByTagName with #happy");
      const postsWithHappy = await getPostsByTagName("#happy");
      console.log("Result:", postsWithHappy);

      console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    } 
  }
  
  rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end())
