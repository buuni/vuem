<template>
  <div class="hello">
	  <h2>User</h2>
	  <div v-if="user && !user.$pending">
		  <p>Id: {{ user.id }}</p>
		  <p>Name: {{ user.name }}</p>
		  <p>Messages: </p>
		  <ul v-if="user.messages.pending === false">
			  <li v-for="message in user.$messages">
				  {{ message.text }}
			  </li>
		  </ul>
		  <p v-if="user.messages.pending === true">Loading messages ...</p>
		  <button @click="onChangeName">Change Name</button>
		  <button @click="onAddMessage">Add Message</button>
	  </div>
	  <div v-else>Loading ...</div>
  </div>
</template>

<script>

	import {mapGetters, mapMutations} from 'vuex';
	import User from './User';

export default {
  name: 'HelloWorld',
  props: {
    id: String
  },
	data() {
  	return {
  		user: User.fetch(2, this.$store),
	  }
	},
	computed: {
  	// user: {
  	// 	get() {
			//   const user = User.fetch(2, this.$store);
			//   console.log(user);
			//   return user;
		 //  },
		 //  set(val) {
  	// 		console.log(val);
		 //  }
	  // }
	},
	methods: {
		onChangeName() {
			this.user.name = Date.now().toString();
		},
		onAddMessage() {
			// this.user.$messages().push(1);
			this.$store.commit('user/pushToProperty', {
				id: this.user.id,
				property: 'messages',
				value: 1,
			});
		}
	},
	mounted() {
  	this.user = User.fetch(2, this.$store);
  	// this.storeUser = this.$store.getters['user/find'](1);

  	console.log(this.user);
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
