import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { useMockStore } from "@/mocks/state"
import { useDefaultDriver } from "@/components/driver/driver-layout"

export const Route = createFileRoute("/driver/login")({
  component: DriverLoginPage,
})

function DriverLoginPage() {
  const navigate = useNavigate()
  const setCurrentRole = useMockStore((s) => s.setCurrentRole)
  const driver = useDefaultDriver()

  const [stage, setStage] = React.useState<"phone" | "otp">("phone")
  const [phone, setPhone] = React.useState(driver?.phone ?? "")
  const [otp, setOtp] = React.useState("")

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (phone.trim().length < 6) return
    setStage("otp")
  }

  React.useEffect(() => {
    if (otp.length === 6) {
      setCurrentRole("driver")
      navigate({ to: "/driver" })
    }
  }, [otp, setCurrentRole, navigate])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Driver sign in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your phone, then the six digit code we send by SMS.
        </p>
      </header>

      <Card size="sm">
        <CardContent className="flex flex-col gap-5 py-2">
          {stage === "phone" ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-phone">Phone number</Label>
                <input
                  id="driver-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 814 3000 0001"
                  className="h-11 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                />
                <p className="text-xs text-muted-foreground">
                  Demo accepts any phone. Default is Andi Saputra.
                </p>
              </div>
              <Button type="submit" size="lg" className="h-12 w-full">
                Send code
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Six digit code</Label>
                <p className="text-xs text-muted-foreground">
                  Sent to {phone}. Any 6 digits unlock the demo.
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-11 text-base"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOtp("")
                  setStage("phone")
                }}
              >
                Use a different phone
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
