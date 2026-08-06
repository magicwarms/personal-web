/**
 * Syntax-highlighted code shown in the hero panel.
 *
 * Tokens carry a semantic kind rather than a colour so the theme lives in CSS
 * (see `CodePanel.vue`) and stays consistent with the rest of the palette.
 */

export type TokenKind = 'plain' | 'keyword' | 'fn' | 'string' | 'const' | 'comment'

export interface Token {
  kind: TokenKind
  text: string
}

export interface Snippet {
  id: string
  lang: string
  file: string
  badges: string[]
  lines: Token[][]
}

const t = (text: string): Token => ({ kind: 'plain', text })
const k = (text: string): Token => ({ kind: 'keyword', text })
const f = (text: string): Token => ({ kind: 'fn', text })
const s = (text: string): Token => ({ kind: 'string', text })
const c = (text: string): Token => ({ kind: 'const', text })
const comment = (text: string): Token => ({ kind: 'comment', text })

export const snippets: Snippet[] = [
  {
    id: 'go',
    lang: 'Go',
    file: 'service/order.go',
    badges: ['● go 1.22', 'fiber', 'postgres', 'redis', 'meilisearch'],
    lines: [
      [comment('// handler → service → repository')],
      [k('func'), t(' (s *orderService) '), f('Place'), t('(')],
      [t('  ctx context.Context, in OrderInput,')],
      [t(') error {')],
      [t('  '), k('if'), t(' err := s.repo.Tx(ctx, '), k('func'), t('(tx Repo) error {')],
      [t('    '), k('return'), t(' tx.CreateOrder(ctx, in)')],
      [t('  }); err != '), c('nil'), t(' {')],
      [t('    '), k('return'), t(' fmt.Errorf('), s('"place order: %w"'), t(', err)')],
      [t('  }')],
      [t('  s.bus.Publish('), s('"order.created"'), t(', in.ID)')],
      [t('  '), k('return'), t(' '), c('nil')],
      [t('}')],
    ],
  },
  {
    id: 'typescript',
    lang: 'TypeScript',
    file: 'orders/orders.service.ts',
    badges: ['● node 20', 'nestjs', 'typeorm', 'rabbitmq', 'graphql'],
    lines: [
      [comment('// NestJS provider, constructor injection')],
      [k('@Injectable'), t('()')],
      [k('export class'), t(' '), f('OrdersService'), t(' {')],
      [t('  constructor(')],
      [t('    '), k('private readonly'), t(' repo: OrderRepo,')],
      [t('    '), k('private readonly'), t(' bus: EventBus,')],
      [t('  ) {}')],
      [t('  '), k('async'), t(' '), f('place'), t('(input: OrderInput): Promise<Order> {')],
      [t('    '), k('const'), t(' order = '), k('await'), t(' '), k('this'), t('.repo.tx((t) =>')],
      [t('      t.createOrder(input),')],
      [t('    );')],
      [t('    '), k('await'), t(' '), k('this'), t('.bus.emit('), s("'order.created'"), t(', order.id);')],
      [t('    '), k('return'), t(' order;')],
      [t('  }')],
      [t('}')],
    ],
  },
]
