import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Props = {
  title: string
  description: string
  sprint: string
  bullets?: string[]
}

export function ComingSoon({ title, description, sprint, bullets }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="font-normal">
          {sprint}
        </Badge>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>In design</CardTitle>
          <CardDescription>
            This surface is sketched in the PRD. The shell is wired so you can
            navigate to it, the working view ships next sprint.
          </CardDescription>
        </CardHeader>
        {bullets && bullets.length > 0 ? (
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        ) : null}
      </Card>
    </div>
  )
}
