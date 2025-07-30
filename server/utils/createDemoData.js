const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Sample profile photos (using Unsplash for demo)
const sampleAvatars = [
  'https://images.unsplash.com/photo-1494790108755-2616b14a9a66?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f84?w=150&h=150&fit=crop&crop=face'
];

// Sample cover photos
const sampleCoverPhotos = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=300&fit=crop'
];

// Sample post images
const samplePostImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=600&h=400&fit=crop'
];

// Sample video URLs (using more reliable video sources)
const sampleVideos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

// Sample users data
const sampleUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    fullName: 'John Doe',
    bio: '🚀 Software Engineer | Tech Enthusiast | Coffee Lover ☕',
    avatar: sampleAvatars[0],
    coverPhoto: sampleCoverPhotos[0]
  },
  {
    username: 'sarah_wilson',
    email: 'sarah@example.com',
    password: 'password123',
    fullName: 'Sarah Wilson',
    bio: '📸 Travel Photographer | Adventure Seeker | 🌍 Wanderlust',
    avatar: sampleAvatars[1],
    coverPhoto: sampleCoverPhotos[1]
  },
  {
    username: 'mike_johnson',
    email: 'mike@example.com',
    password: 'password123',
    fullName: 'Mike Johnson',
    bio: '🎨 UI/UX Designer | Creative Mind | Making the web beautiful ✨',
    avatar: sampleAvatars[2],
    coverPhoto: sampleCoverPhotos[2]
  },
  {
    username: 'emma_brown',
    email: 'emma@example.com',
    password: 'password123',
    fullName: 'Emma Brown',
    bio: '🏃‍♀️ Fitness Coach | Healthy Living | Motivating others to be their best 💪',
    avatar: sampleAvatars[3],
    coverPhoto: sampleCoverPhotos[3]
  },
  {
    username: 'alex_garcia',
    email: 'alex@example.com',
    password: 'password123',
    fullName: 'Alex Garcia',
    bio: '🎵 Music Producer | Sound Engineer | Creating beats that move souls 🎧',
    avatar: sampleAvatars[4],
    coverPhoto: sampleCoverPhotos[4]
  },
  {
    username: 'lisa_chen',
    email: 'lisa@example.com',
    password: 'password123',
    fullName: 'Lisa Chen',
    bio: '👩‍🍳 Food Blogger | Recipe Creator | Sharing delicious moments 🍰',
    avatar: sampleAvatars[5],
    coverPhoto: sampleCoverPhotos[0]
  },
  {
    username: 'david_smith',
    email: 'david@example.com',
    password: 'password123',
    fullName: 'David Smith',
    bio: '📚 Writer | Storyteller | Crafting words that inspire 🖋️',
    avatar: sampleAvatars[6],
    coverPhoto: sampleCoverPhotos[1]
  },
  {
    username: 'maya_patel',
    email: 'maya@example.com',
    password: 'password123',
    fullName: 'Maya Patel',
    bio: '🧘‍♀️ Yoga Instructor | Mindfulness Coach | Finding balance in life 🌸',
    avatar: sampleAvatars[7],
    coverPhoto: sampleCoverPhotos[2]
  }
];

// Sample posts content
const samplePosts = [
  {
    content: "Just finished building an amazing web application! The feeling when your code finally works perfectly is unmatched 🚀 #coding #webdev #javascript",
    images: [samplePostImages[0]],
    hashtags: ['coding', 'webdev', 'javascript']
  },
  {
    content: "Sunset views from my latest travel adventure in Santorini! Sometimes you need to disconnect to truly connect with the world around you 🌅✈️",
    images: [samplePostImages[1], samplePostImages[2]],
    hashtags: ['travel', 'sunset', 'santorini']
  },
  {
    content: "Working on some exciting new UI designs today. Clean, minimal, and user-focused. The best interfaces are the ones users don't even notice! 🎨",
    images: [samplePostImages[3]],
    hashtags: ['design', 'ui', 'ux']
  },
  {
    content: "Morning workout complete! 💪 Remember, fitness is not about being better than someone else. It's about being better than you used to be. #fitness #motivation",
    images: [samplePostImages[4]],
    hashtags: ['fitness', 'motivation', 'workout']
  },
  {
    content: "Just dropped a new track! 🎵 Been working on this beat for weeks. Music has this incredible power to connect souls across any distance. What are you listening to today?",
    hashtags: ['music', 'producer', 'newtrack']
  },
  {
    content: "Tried a new recipe today - homemade pasta with truffle sauce! 🍝 Cooking is like love, it should be entered into with abandon or not at all. Recipe in comments!",
    images: [samplePostImages[5]],
    hashtags: ['cooking', 'pasta', 'foodie']
  },
  {
    content: "Words have power. Today I'm reminded that every story we tell has the potential to change someone's world. What's your story? 📚✨",
    hashtags: ['writing', 'storytelling', 'inspiration']
  },
  {
    content: "Morning meditation session by the lake 🧘‍♀️ In the stillness, we find our strength. In the silence, we hear our truth. Namaste 🙏",
    images: [samplePostImages[6]],
    hashtags: ['yoga', 'meditation', 'mindfulness']
  },
  {
    content: "Coffee and code - the perfect combination for a productive Sunday! ☕💻 Working on something exciting that I can't wait to share with you all!",
    images: [samplePostImages[7]],
    hashtags: ['coffee', 'coding', 'sunday']
  },  {
    content: "Team collaboration is everything! Just finished an amazing brainstorming session. The best ideas come when creative minds unite 🤝💡 #teamwork",
    hashtags: ['teamwork', 'collaboration', 'ideas']
  },
  {
    content: "Behind-the-scenes of our latest project! 🎬 The creative process is always exciting. Here's a quick time-lapse of our design session.",
    video: sampleVideos[0],
    hashtags: ['behindthescenes', 'creative', 'timelapse']
  },
  {
    content: "Live coding session highlights! 💻 Built a React component from scratch and got amazing feedback from the community. Thanks everyone who joined! #coding #react",
    video: sampleVideos[1],
    hashtags: ['coding', 'react', 'livecoding']
  },
  {
    content: "Quick workout tutorial for busy professionals! 💪 No equipment needed - just 15 minutes to boost your energy and mood. Try it out! #fitness #tutorial",
    video: sampleVideos[2],
    hashtags: ['fitness', 'tutorial', 'workout']
  },
  {
    content: "Throwback to last month's mountain adventure! ⛰️ Sometimes you need to disconnect from technology and reconnect with nature. Best decision ever!",
    images: [samplePostImages[8], samplePostImages[9]],
    hashtags: ['throwback', 'mountain', 'nature']
  },
  {
    content: "New recipe alert! 🍝 Homemade pasta with garden-fresh basil. The secret ingredient? Love and patience! Who wants the recipe? #cooking #homemade",
    images: [samplePostImages[10]],
    hashtags: ['recipe', 'pasta', 'homemade']
  }
];

// Sample comments
const sampleComments = [
  "This is amazing! Great work! 👏",
  "Love this! Can you share more details?",
  "Incredible shot! 📸",
  "So inspiring! Keep it up! 💪",
  "This made my day! Thank you for sharing ❤️",
  "Absolutely beautiful! 😍",
  "Great perspective! I never thought of it that way",
  "This is exactly what I needed to see today! 🙌",
  "Your work always inspires me! 🌟",
  "Can't wait to try this myself!",
  "Such talent! 🎨",
  "This speaks to my soul 💫"
];

// Sample chat messages
const sampleChatMessages = [
  "Hey! How are you doing?",
  "Good morning! ☀️",
  "Did you see the latest update?",
  "That project looks amazing! 🚀",
  "Want to grab coffee later? ☕",
  "Thanks for the help yesterday!",
  "Happy Friday! Any weekend plans? 🎉",
  "Just finished the design mockups",
  "The weather is perfect today! 🌞",
  "Let's schedule a meeting soon",
  "Great presentation today! 👏",
  "Can you review this when you have time?",
  "Lunch break! Anyone hungry? 🍕",
  "Working late tonight 😅",
  "Have a great weekend! 🌈"
];

const createDemoData = async () => {
  try {
    console.log('🎭 Creating demo data...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Chat.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('🗑️ Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log(`👥 Created ${users.length} users`);

    // Create follow relationships
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const followCount = Math.floor(Math.random() * 4) + 2; // Follow 2-5 users
      
      for (let j = 0; j < followCount; j++) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const userToFollow = users[randomIndex];
        
        if (userToFollow._id.toString() !== user._id.toString() && 
            !user.following.includes(userToFollow._id)) {
          user.following.push(userToFollow._id);
          userToFollow.followers.push(user._id);
        }
      }
      await user.save();
    }

    // Save all users after follow relationships
    await Promise.all(users.map(user => user.save()));
    console.log('🤝 Created follow relationships');

    // Create posts
    const posts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const post = new Post({
        ...postData,
        author: randomUser._id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
      });

      // Add random likes
      const likeCount = Math.floor(Math.random() * 15) + 1;
      for (let j = 0; j < likeCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (!post.likes.find(like => like.user.toString() === randomUser._id.toString())) {
          post.likes.push({ user: randomUser._id });
        }
      }

      await post.save();
      posts.push(post);
    }
    console.log(`📝 Created ${posts.length} posts`);

    // Create comments
    for (const post of posts) {
      const commentCount = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post
      
      for (let i = 0; i < commentCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        const comment = new Comment({
          post: post._id,
          author: randomUser._id,
          content: randomComment,
          createdAt: new Date(post.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        });

        // Add random likes to comments
        const likeCount = Math.floor(Math.random() * 8);
        for (let j = 0; j < likeCount; j++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          if (!comment.likes.find(like => like.user.toString() === randomUser._id.toString())) {
            comment.likes.push({ user: randomUser._id });
          }
        }

        await comment.save();
        post.comments.push(comment._id);
      }
      await post.save();
    }
    console.log('💬 Created comments');

    // Create chats and messages
    const chats = [];
    
    // Create some 1-to-1 chats
    for (let i = 0; i < 8; i++) {
      const user1 = users[Math.floor(Math.random() * users.length)];
      let user2 = users[Math.floor(Math.random() * users.length)];
      
      while (user2._id.toString() === user1._id.toString()) {
        user2 = users[Math.floor(Math.random() * users.length)];
      }

      const chat = new Chat({
        participants: [user1._id, user2._id],
        isGroupChat: false,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });

      await chat.save();
      chats.push(chat);

      // Add messages to chat
      const messageCount = Math.floor(Math.random() * 10) + 5; // 5-15 messages
      
      for (let j = 0; j < messageCount; j++) {
        const sender = Math.random() > 0.5 ? user1 : user2;
        const randomMessage = sampleChatMessages[Math.floor(Math.random() * sampleChatMessages.length)];
        
        const message = new Message({
          chat: chat._id,
          sender: sender._id,
          content: randomMessage,
          createdAt: new Date(chat.lastActivity.getTime() + j * 60 * 1000) // Messages 1 minute apart
        });

        await message.save();
        chat.lastMessage = message._id;
        chat.lastActivity = message.createdAt;
      }
      
      await chat.save();
    }

    // Create some group chats
    for (let i = 0; i < 3; i++) {
      const participantCount = Math.floor(Math.random() * 4) + 3; // 3-6 participants
      const participants = [];
      
      while (participants.length < participantCount) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (!participants.find(p => p.toString() === randomUser._id.toString())) {
          participants.push(randomUser._id);
        }
      }

      const groupNames = ['Dev Team 💻', 'Coffee Lovers ☕', 'Travel Squad ✈️', 'Fitness Group 💪', 'Foodies 🍕'];
      
      const chat = new Chat({
        participants,
        isGroupChat: true,
        groupName: groupNames[i % groupNames.length],
        groupDescription: 'A great group chat for awesome people!',
        creator: participants[0],
        admins: [participants[0]],
        lastActivity: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
      });

      await chat.save();
      chats.push(chat);

      // Add messages to group chat
      const messageCount = Math.floor(Math.random() * 15) + 10; // 10-25 messages
      
      for (let j = 0; j < messageCount; j++) {
        const randomSender = participants[Math.floor(Math.random() * participants.length)];
        const randomMessage = sampleChatMessages[Math.floor(Math.random() * sampleChatMessages.length)];
        
        const message = new Message({
          chat: chat._id,
          sender: randomSender,
          content: randomMessage,
          createdAt: new Date(chat.lastActivity.getTime() + j * 30 * 1000) // Messages 30 seconds apart
        });

        await message.save();
        chat.lastMessage = message._id;
        chat.lastActivity = message.createdAt;
      }
      
      await chat.save();
    }

    console.log(`💬 Created ${chats.length} chats with messages`);

    // Create notifications
    for (const user of users) {
      const notificationCount = Math.floor(Math.random() * 8) + 3; // 3-10 notifications
      
      for (let i = 0; i < notificationCount; i++) {
        const randomSender = users[Math.floor(Math.random() * users.length)];
        if (randomSender._id.toString() !== user._id.toString()) {
          
          const notificationTypes = [
            { type: 'like', message: `${randomSender.fullName} liked your post` },
            { type: 'comment', message: `${randomSender.fullName} commented on your post` },
            { type: 'follow', message: `${randomSender.fullName} started following you` },
            { type: 'mention', message: `${randomSender.fullName} mentioned you in a post` }
          ];
          
          const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          const notification = new Notification({
            recipient: user._id,
            sender: randomSender._id,
            type: randomNotification.type,
            message: randomNotification.message,
            isRead: Math.random() > 0.6, // 40% unread
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          });

          await notification.save();
        }
      }
    }

    console.log('🔔 Created notifications');

    console.log(`
🎉 Demo data created successfully!

📊 Summary:
- ${users.length} Users with realistic profiles
- ${posts.length} Posts with images and engagement
- Multiple comments with likes
- ${chats.length} Active chats (1-to-1 and groups) with message history
- Notifications for all users
- Follow relationships between users

🔑 Demo Accounts (all passwords: password123):
${users.map(user => `- ${user.fullName} (@${user.username}) - ${user.email}`).join('\n')}

🌐 You can now login with any of these accounts to explore the full functionality!
    `);

    return {
      users: users.length,
      posts: posts.length,
      chats: chats.length,
      success: true
    };

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    throw error;
  }
};

module.exports = { createDemoData };
