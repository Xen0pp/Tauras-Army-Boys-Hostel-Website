
const { adminDb } = require('./src/lib/firebase/admin');

async function removeXen0pppPosts() {
  try {
    const postsRef = adminDb.collection('posts');
    const snapshot = await postsRef.get();
    
    let removedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.createdBy?.firstName === 'Xen0ppp' || data.createdBy?.lastName === 'Xen0ppp' || data.createdBy?.firstName + ' ' + data.createdBy?.lastName === 'Xen0ppp') {
        console.log(`Deleting post with ID: ${doc.id} from user Xen0ppp`);
        await postsRef.doc(doc.id).delete();
        removedCount++;
      }
    }
    console.log(`Removed ${removedCount} posts from Xen0ppp.`);
  } catch (error) {
    console.error('Error removing posts:', error);
  }
  process.exit(0);
}

removeXen0pppPosts();
