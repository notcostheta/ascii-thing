import { Layout } from '@/components/layout'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <Layout>
      {/* <div className="py-8 flex justify-center">
        <Image
          src="/placeholder.svg?height=200&width=400"
          alt="Donut ASCII Art"
          width={400}
          height={200}
          className="dark:invert"
        />
      </div> */}
      <div className="py-12">
        <h1 className="text-4xl font-normal mb-8">Yo, I'm Donut!</h1>
        <div className="space-y-4">
          <p>Fresh from X? You're in for a treat.</p>
          <p>
            Here, I zoom out on the daily grind, discuss the big picture,
            and share thoughts on various topics.
          </p>
          <p>
            I'll share the progress reports, current CS/ML projects, long-form
            posts, <span className="underline">resources</span>, and whatever catches my fancy.
          </p>
          <p>It's like my X feed but supersized.</p>
          <p>
            Wanna exchange ideas?{' '}
            <span className="text-[var(--link)]">DM me @donutdaily</span> on X
          </p>
        </div>

        <div className="mt-12 text-right">
          <h2 className="text-2xl font-normal mb-4">Who am I?</h2>
          <div className="space-y-4">
            <p>
              After 5+ years in marketing, including running my own agency,<br />
              I've made an unexpected pivot.
            </p>
            <p>
              I realized the industry's shift toward short-term gains over<br />
              creative integrity was killing me.
            </p>
            <p>
              Disheartened by the soulless business practices, I decided to<br />
              pursue something more fulfilling.
            </p>
            <p>
              Now, I'm fully committed to progressing in CS and ML.
            </p>
            <p>
              <Link href="/about" className="text-[var(--link)] hover:underline">
                Read the post
              </Link>
            </p>
          </div>
        </div>
        {/* Recent posts section removed */}
      </div>
    </Layout>
  )
}

