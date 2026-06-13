import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { SmartPhone01Icon, ShieldUserIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useMockStore } from "@/mocks/state"

export const Route = createFileRoute("/store/login")({ component: StoreLogin })

function StoreLogin() {
  const setRole = useMockStore((s) => s.setCurrentRole)
  const navigate = useNavigate()

  const [phone, setPhone] = React.useState("+62 813 2000 0001")
  const [step, setStep] = React.useState<"phone" | "otp">("phone")
  const [otp, setOtp] = React.useState("")

  function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setStep("otp")
  }

  function verifyCode(value: string) {
    setOtp(value)
    if (value.length === 6) {
      setRole("store")
      navigate({ to: "/store" })
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-8 px-6 pt-10 pb-8">
      <div className="flex flex-col items-center gap-3 pt-4">
        <span className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <HugeiconsIcon
            icon={step === "phone" ? SmartPhone01Icon : ShieldUserIcon}
            strokeWidth={2}
            className="size-6"
          />
        </span>
        <div className="text-center">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {step === "phone" ? "Masuk ke SuperSales" : "Masukkan kode"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "phone"
              ? "Kami kirim kode 6 digit ke nomor WhatsApp Anda."
              : `Kode dikirim ke ${phone}.`}
          </p>
        </div>
      </div>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 8xx xxxx xxxx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Demo: nomor sudah diisi, lanjut saja.
            </p>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Send code
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={verifyCode}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Demo: enam digit apa saja diterima.
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setOtp("")
              setStep("phone")
            }}
          >
            Ganti nomor
          </Button>
        </div>
      )}

      <p className="mt-auto text-center text-[11px] text-muted-foreground">
        Dengan masuk, Anda menyetujui Syarat Layanan SuperSales.
      </p>
    </div>
  )
}
