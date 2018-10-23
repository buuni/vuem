<template>
  <div class="home" style="display: flex">
    <div v-if="user" style="width: 50%">
      <p>Name: <input type="text" v-model="user.name"/></p>
      <p>Message:</p>
      <p>Text: <input type="text" v-model="messageText"/></p>
      <p><button @click="saveMessage">Add Message</button></p>
    </div>
    <div v-if="user" style="width: 50%">
      <p>Name: {{ user.name }}</p>
      <p>Messages:</p>
      <ul>
        <li v-for="message in user.$messages" :key="message.id">
          <p>{{ message.text }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';

export default {
  name: 'create-user',
  data() {
  	return {
  		user: this.$models.User.create().witch('messages'),
		  messageText: '',
    }
  },
  methods: {
	  saveMessage() {
	  	const message = this.$models.Message.create({
        text: this.messageText
      });
      console.log(message);
      console.log(this.user);
	  	// this.user.$messages.push(message);
	  	this.user.messages.push(message.id);
	  	this.messageText = '';
    }
  }
}
</script>
