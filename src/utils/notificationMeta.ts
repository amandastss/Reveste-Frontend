export type NotificationKind = 'answer' | 'question' | 'info'

export interface NotificationMeta {
  title: string
  icon: string
  kind: NotificationKind
}

export function getNotificationMeta(notification: {
  mensagem?: string | null
  tipo?: string | null
}): NotificationMeta {
  const combined = `${notification.tipo ?? ''} ${notification.mensagem ?? ''}`.toLowerCase()

  if (
    /resposta|respondida|respondeu|respondido|pergunta respondida|sua pergunta.*resposta|foi respondida/i.test(combined)
  ) {
    return {
      title: 'Resposta do vendedor',
      icon: 'check_circle',
      kind: 'answer',
    }
  }

  if (/pergunta|nova pergunta|question/i.test(combined)) {
    return {
      title: 'Nova pergunta',
      icon: 'question_answer',
      kind: 'question',
    }
  }

  return {
    title: 'Nova atualização',
    icon: 'notifications',
    kind: 'info',
  }
}
