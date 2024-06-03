<template>
    <h1>Create Account</h1>
    <form @submit="onSubmit">
        <label>Email: </label>
        <input type="email" v-model="email" v-bind="emailAttrs" />

        <label>Password: </label>
        <input type="password" v-model="password" v-bind="passwordAttrs" />
        
        <label>First Name: </label>
        <input type="text" v-model="firstName" v-bind="firstNameAttrs" />

        <label>Last Name: </label>
        <input type="password" v-model="lastName" v-bind="lastNameAttrs" />
        <button class="mt-5" >Submit</button>
    </form>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate';
const {values, defineField, handleSubmit} = useForm()

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [firstName, firstNameAttrs] = defineField('firstName')
const [lastName, lastNameAttrs] = defineField('lastName')
const config = useRuntimeConfig()

const onSubmit = handleSubmit(async (values) => {
    const { data, pending, error, refresh } = await useFetch(config.public.dev_endpoint + "register", {
        method: "POST",
        body: values
    })
});
</script>

<style scoped>

input {
    display: block;
}
</style>