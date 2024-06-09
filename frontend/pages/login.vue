<template>
    <h1>Log in</h1>
    <form @submit="onSubmit">
        <label>Email: </label>
        <input type="email" v-model="email" v-bind="emailAttrs" />

        <label>Password: </label>
        <input type="password" v-model="password" v-bind="passwordAttrs" />
        <button class="mt-5" >Submit</button>
    </form>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate';
const {values, defineField, handleSubmit} = useForm()

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const config = useRuntimeConfig()

const onSubmit = handleSubmit(async (values) => {
    const { data, pending, error, refresh } = await useFetch(config.public.dev_endpoint + "login", {
        method: "POST",
        body: values
    })

    const tokens = useCookie('tokens')
    tokens.value = JSON.parse(JSON.stringify(data.value as string))
});
</script>

<style scoped>

input {
    display: block;
}
</style>