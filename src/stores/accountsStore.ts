import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'

export interface TagItem {
  text: string
}

export interface Account {
  id: string
  tags: TagItem[]
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
  isValid: boolean
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts: Ref<Account[]> = ref([])

  // Загрузка из localStorage при инициализации
  const loadAccounts = () => {
    const stored = localStorage.getItem('accounts')
    if (stored) {
      try {
        accounts.value = JSON.parse(stored)
      } catch (error) {
        console.error('Error loading accounts from localStorage:', error)
        accounts.value = []
      }
    }
  }

  // Сохранение в localStorage
  const saveAccounts = () => {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }

  // Создание новой учетной записи
  const createAccount = (): Account => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      tags: [],
      type: 'Локальная',
      login: '',
      password: '',
      isValid: false
    }
  }

  // Добавление новой учетной записи
  const addAccount = () => {
    const newAccount = createAccount()
    accounts.value.push(newAccount)
    saveAccounts()
  }

  // Удаление учетной записи
  const removeAccount = (id: string) => {
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      saveAccounts()
    }
  }

  // Обновление учетной записи
  const updateAccount = (id: string, updates: Partial<Account>) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      Object.assign(account, updates)
      saveAccounts()
    }
  }

  // Валидация учетной записи
  const validateAccount = (account: Account): boolean => {
    const hasLogin = account.login.trim().length > 0 && account.login.length <= 100
    const hasPassword = account.type === 'LDAP' || (account.password !== null && account.password.trim().length > 0 && account.password.length <= 100)
    const hasValidTags = account.tags.every(tag => tag.text.length <= 50)
    
    return hasLogin && hasPassword && hasValidTags
  }

  // Преобразование строки меток в массив объектов
  const parseTagsString = (tagsString: string): TagItem[] => {
    if (!tagsString.trim()) return []
    
    return tagsString.split(';')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => ({ text: tag }))
  }

  // Преобразование массива меток в строку
  const tagsToString = (tags: TagItem[]): string => {
    return tags.map(tag => tag.text).join('; ')
  }

  // Computed свойства
  const accountsCount = computed(() => accounts.value.length)
  const validAccountsCount = computed(() => accounts.value.filter(acc => acc.isValid).length)

  // Инициализация при создании store
  loadAccounts()

  return {
    accounts,
    accountsCount,
    validAccountsCount,
    addAccount,
    removeAccount,
    updateAccount,
    validateAccount,
    parseTagsString,
    tagsToString,
    loadAccounts
  }
}) 