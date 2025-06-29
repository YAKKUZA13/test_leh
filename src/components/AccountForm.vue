<template>
  <div class="account-form">
    <div class="form-header">
      <h2>Учетные записи</h2>
      <Button 
        icon="pi pi-plus" 
        @click="handleAddAccount"
        severity="primary"
        size="small"
        aria-label="Добавить учетную запись"
      />
    </div>

    <div class="form-hint">
      <i class="pi pi-info-circle"></i>
      <span>Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</span>
    </div>

    <div class="accounts-list">
      <div class="accounts-header">
        <div class="header-col">Метка</div>
        <div class="header-col">Тип записи</div>
        <div class="header-col">Логин</div>
        <div class="header-col">Пароль</div>
        <div class="header-col"></div>
      </div>

      <form 
        v-for="account in accountsStore.accounts" 
        :key="account.id"
        @submit.prevent
        class="account-form-item"
      >
        <div class="account-row" :class="{ 'ldap-layout': account.type === 'LDAP' }">
          <div class="account-field">
            <InputText
              :modelValue="accountsStore.tagsToString(account.tags)"
              @update:modelValue="(value) => handleTagsInput(account.id, value)"
              @blur="handleTagsChange(account.id, $event)"
              placeholder="Значение"
              :class="{ 'p-invalid': !account.isValid && account.tags.some(tag => tag.text.length > 50) }"
              maxlength="200"
              :aria-label="`Метки для учетной записи ${account.login || 'без логина'}`"
              autocomplete="off"
            />
          </div>

          <div class="account-field">
            <Select
              :modelValue="account.type"
              @update:modelValue="(value) => handleTypeChange(account.id, value)"
              :options="typeOptions"
              placeholder="Выберите тип"
              :class="{ 'p-invalid': !account.isValid }"
              :aria-label="`Тип записи для ${account.login || 'новой учетной записи'}`"
            />
          </div>

          <div class="account-field" :class="{ 'login-expanded': account.type === 'LDAP' }">
            <InputText
              :modelValue="account.login"
              @update:modelValue="(value) => handleLoginChange(account.id, value)"
              @blur="handleValidation(account.id)"
              placeholder="Значение"
              :class="{ 'p-invalid': !account.isValid && (!account.login || account.login.length > 100) }"
              maxlength="100"
              :aria-label="`Логин для учетной записи`"
              autocomplete="username"
              required
            />
          </div>

          <div v-if="account.type === 'Локальная'" class="account-field">
            <Password
              :modelValue="account.password || ''"
              @update:modelValue="(value) => handlePasswordChange(account.id, value)"
              @blur="handleValidation(account.id)"
              placeholder="Значение"
              :class="{ 'p-invalid': !account.isValid && account.type === 'Локальная' && (!account.password || account.password.length > 100) }"
              :feedback="false"
              toggleMask
              maxlength="100"
              :aria-label="`Пароль для учетной записи ${account.login || 'без логина'}`"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="account-field">
            <Button
              icon="pi pi-eye"
              severity="secondary"
              text
              size="small"
              class="view-btn"
              :aria-label="`Просмотреть учетную запись ${account.login || 'без логина'}`"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              size="small"
              @click="handleDeleteAccount(account.id)"
              :aria-label="`Удалить учетную запись ${account.login || 'без логина'}`"
            />
          </div>
        </div>
      </form>

      <div v-if="accountsStore.accounts.length === 0" class="no-accounts">
        <p>Нет добавленных учетных записей</p>
        <p class="no-accounts-hint">Нажмите кнопку "+" чтобы добавить первую учетную запись</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Password from 'primevue/password'
import { useAccountsStore } from '../stores/accountsStore'
import type { Account } from '../stores/accountsStore'

const accountsStore = useAccountsStore()

const typeOptions = ref([
  'LDAP',
  'Локальная'
])

const handleAddAccount = () => {
  accountsStore.addAccount()
}

const handleDeleteAccount = (id: string) => {
  accountsStore.removeAccount(id)
}

const handleTagsChange = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const tagsString = target.value
  const tags = accountsStore.parseTagsString(tagsString)
  
  accountsStore.updateAccount(id, { tags })
  handleValidation(id)
}

const handleTypeChange = (id: string, type: any) => {
  if (!type || (type !== 'LDAP' && type !== 'Локальная')) return
  
  const validType = type as 'LDAP' | 'Локальная'
  const updates: Partial<Account> = { type: validType }
  
  if (validType === 'LDAP') {
    updates.password = null
  } else if (validType === 'Локальная') {
    updates.password = ''
  }
  
  accountsStore.updateAccount(id, updates)
  handleValidation(id)
}

const handleLoginChange = (id: string, login: string | undefined) => {
  if (login === undefined) return
  accountsStore.updateAccount(id, { login })
}

const handlePasswordChange = (id: string, password: string | undefined) => {
  if (password === undefined) return
  accountsStore.updateAccount(id, { password })
}

const handleValidation = (id: string) => {
  const account = accountsStore.accounts.find(acc => acc.id === id)
  if (account) {
    const isValid = accountsStore.validateAccount(account)
    accountsStore.updateAccount(id, { isValid })
  }
}

const handleTagsInput = (id: string, value: string | undefined) => {
  if (!value) return
  const tags = accountsStore.parseTagsString(value)
  accountsStore.updateAccount(id, { tags })
  handleValidation(id)
}
</script>

<style scoped>
.account-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h2 {
  margin: 0;
  color: #333;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #e3f2fd;
  border-radius: 6px;
  margin-bottom: 20px;
  color: #1565c0;
}

.form-hint i {
  font-size: 16px;
}

.accounts-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.accounts-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 2fr 120px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.header-col {
  padding: 12px 16px;
  font-weight: 600;
  color: #333;
  border-right: 1px solid #ddd;
}

.header-col:last-child {
  border-right: none;
}

.account-form-item {
  border-bottom: 1px solid #eee;
}

.account-form-item:last-of-type {
  border-bottom: none;
}

.account-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 2fr 120px;
}

.account-row.ldap-layout {
  grid-template-columns: 2fr 1.5fr 4fr 120px;
}

.login-expanded {
  grid-column: span 1;
}

.account-field {
  padding: 12px 16px;
  border-right: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-field:last-child {
  border-right: none;
  justify-content: center;
}

.account-field :deep(.p-inputtext),
.account-field :deep(.p-select),
.account-field :deep(.p-password) {
  width: 100%;
}

.account-field :deep(.p-invalid) {
  border-color: #e74c3c;
}

.view-btn {
  opacity: 0.5;
}

.no-accounts {
  padding: 40px;
  text-align: center;
  color: #666;
}

.no-accounts p {
  margin: 0;
  font-style: italic;
}

.no-accounts-hint {
  margin-top: 8px !important;
  font-size: 14px;
  color: #999;
}

@media (max-width: 768px) {
  .accounts-header,
  .account-row,
  .account-row.ldap-layout {
    grid-template-columns: 1fr;
  }
  
  .header-col,
  .account-field {
    border-right: none;
    border-bottom: 1px solid #eee;
  }
  
  .header-col:before {
    content: attr(data-label);
    font-weight: bold;
    display: block;
    margin-bottom: 4px;
  }

  .login-expanded {
    grid-column: span 1;
  }
}
</style> 