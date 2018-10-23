<template>
  <div class="home">
    <template v-if="user && !user.$pending">
      <p>Id: {{ user.id }}</p>
      <p>Name: {{ user.name }}</p>
      <p>Pending: {{ user.$pending }}</p>
      <p>Messages:</p>
      <ul v-if="true || user.$messages.pending === false">
        <li v-for="message in user.$messages" v-if="!message.$pending" :key="message.id">
          <p>{{ message.text }}</p>
          <p>Comments: </p>
          <ul v-if="message.$comments.pending === false">
            <li v-for="comment in message.$comments" :key="comment.id">
              {{ comment.comment }}
            </li>
          </ul>
          <p v-else>Loading comments ...</p>
        </li>
      </ul>
      <p v-else>Loading messages ...</p>
    </template>
    <p v-else>Loading ...</p>
    <button @click="nextUser">Next User</button>
    <button @click="changeMessageText">Change Message Text</button>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';

export default {
  name: 'home',
  props: ['id'],
  watch: {
  	id: {
  		async handler(val) {
  			this.user = this.$models.User
          .findById(val)
          .witch('messages', 'messages.comments');
  			console.log(this.user);
      },
      immediate: true,
    }
  },
  data() {
  	return {
  		user: null,
    }
  },
  methods: {
	  test(item) {
	  	console.log('Item:', item);
    },
	  nextUser() {
	  	this.$router.push({name: 'user', params: {id: parseInt(this.id) + 1}});
    },
	  changeMessageText() {
	  	this.user.$messages[0].text = 'New Text';
    }
  }
}
</script>
