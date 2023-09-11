"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const dekirukotos = ["ウェブアプリ", "デザイン", "作字"]
  const SNSs = [
    { icon: "twitter", link: "https://twitter.com/4mpoi" },
    { icon: "github", link: "https://github.com/Ampoi" }
  ]
  const creations = [
    { link: "https://stask.ampoi.net", image: "Stask", name: "Stask", description: "2022年夏〜学力向上アプリコンテスト〜未踏ジュニアにかけて開発している学生向けの課題管理アプリです。使いやすい(使いやすくする)から使ってみてね。" },
    { link: "https://to-be.ampoi.net", image: "ToBe", name: "ToBe", description: "ゲームのスキルツリーみたいな感じで自分のタスクできたら面白そうだな〜　って思って作ったアプリです。" },
    { link: "https://urlmemo.ampoi.net", image: "URLMEMO", name: "URLMEMO", description: "URLを通じてメモを保存・閲覧・共有できるアプリです。Instagramとかでそのまま文見られるよりはひと段落あったほうがいいかなって思って作りました。" },
    { link: "https://131.kaijofes.com/", image: "KAGARIBI", name: "131代海城祭公式サイト", description: "131代の文化祭公式サイトです。" },
    { link: "https://132.kaijofes.com/", image: "KIRAMEKI", name: "132代海城祭公式サイト", description: "132代の文化祭公式サイトです。" },
    { link: "https://github.com/Ampoi/Baser", image: "BASER", name: "BASER", description: "2Dの火星みたいな星の上で色々するゲームです。気が向いたらたまに開発してます。" },
  ]
  const works = [
    { image: "Loneliness", name: "Loneliness", description: "Mrs.GREEN APPLEの「Loneliness」の作字です。"},
    { image: "AKEOME", name: "あけおめ", description: "2023年度元旦のやつです。" },
    { image: "ATTITUDE", name: "Attitude", description: "Mrs.GREEN APPLEの「Attitude」の作字です。" },
    { image: "DORYOKU", name: "努力", description: "KICK BACKの替え歌みたいなのでめっちゃ努力って入ってるやつがあったので作ってみました。特に意味はないです。" },
    { image: "GENDOUKI", name: "原動機", description: "昭和感出したくて作ってみました。" },
    { image: "KAIJUNOHANAUTA", name: "怪獣の花唄", description: "5月くらいまで獣って字の左側に線が入ってるってこと知りませんでした。漢字間違ってます。" },
    { image: "LOVIN", name: "lovin'", description: "Mrs.GREEN APPLEの「lovin'」の作字です。歌がめっちゃ可愛いので聞いてみてください。" },
    { image: "MITIBIKI", name: "導", description: "方べきの定理に見えるとあまり評価は良くなかったです。" },
    { image: "ROUDOU", name: "働", description: "友達とやっていたマイクラの労働サーバーのアイコンです。" },
    { image: "SEITOKAI", name: "生徒会", description: "とりあえず作ってみただけです。特に生徒会への忠誠心とかはありません。" },
    { image: "TUKIMASITEHA", name: "ツキマシテハ", description: "Mrs.GREEN APPLEの「ツキマシテハ」の作字です。本当にいい曲なので聞いてみてください。" },
  ]

  const [isBlack, setIsBlack] = useState(false)

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsBlack(1400 < window.scrollY)
    })
  }, [])

  return (
    <main
      className={`transition duration-500 ${ isBlack ? 'bg-black text-white' : 'bg-white' }`}>
      <div className='w-screen h-screen grid place-content-center'>
        <div className='flex flex-col gap-4 items-center'>
          <Image src="/Ampoi.svg" alt="Ampoi Logo" width={300} height={123}/>
          <div className='flex flex-row gap-4'>
            {dekirukotos.map((dekirukoto) => {
              return (
                <p className='text-sm text-black/60'>{dekirukoto}とか</p>
              )
            })}
          </div>
          <div className='flex flex-row gap-8'>
            {SNSs.map((SNS) => {
              return (
                <a href={SNS.link}>
                  <i className={`bi bi-${SNS.icon} text-black/40 hover:text-black/80 transition-all duration-300`}/>
                </a>
              )
            })}
          </div>
        </div>
      </div>
      <div className='text-center'>
        <h1 className='text-8xl text-black/10 font-bold'>About me</h1>
        <p className='text-lg -mt-10'>
          ごく普通の高校生。あんぽいじゃないですあむぽいです。<br/>
          基本VueをViteとTypeScriptとTailwindCSSを組み合わせて触ってます。
        </p>
      </div>
      <div className='max-w-3xl mx-auto px-4 mt-10'>
        <h2
          className={`text-6xl font-bold transition duration-500 ${ isBlack ? 'text-white/20' : 'text-black/10' }`}>
          Creations
        </h2>
        <p className='-mt-6 ml-4'>これまでに作った作品とかです。マウスをホバーorタップすることで説明を見ることができます。</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
          {creations.map((creation) => {
            return (
              <div
                className='bg-slate-300 rounded-lg relative bg-cover bg-center overflow-hidden'
                style={{
                  aspectRatio: "16/ 9",
                  backgroundImage: `url(./images/creations/${creation.image}.webp)`
                }}>
                <div className='absolute px-4 py-8 bg-white/80 backdrop-blur-sm transition duration-300 opacity-0 hover:opacity-100 h-full w-full overflow-y-auto'>
                  <h1 className='text-3xl font-semibold'>{creation.name}</h1>
                  <p className='mt-2'>{creation.description}</p>
                  <p className='mt-4 underline decoration-dotted decoration-black/20'>
                    <Link
                      href={creation.link}>
                      作品を見る
                    </Link>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='max-w-3xl mx-auto px-4 mt-10'>
        <h2 className={`text-6xl font-bold transition duration-500 ${ isBlack ? 'text-white/20' : 'text-black/10' }`}>Works</h2>
        <p className='-mt-6 ml-4'>これまでに作った作字とかです。たまにTwitterとかで投稿しています。マウスをホバーorタップすることで説明を見ることができます。</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
          {works.map((work) => {
            return (
              <div
                className='bg-slate-300 rounded-lg relative bg-cover bg-center overflow-hidden'
                style={{
                  aspectRatio: "1 / 1",
                  backgroundImage: `url(./images/works/${work.image}.webp)`
                }}>
                <div className='absolute px-4 py-8 bg-black/40 text-white backdrop-blur-xl transition duration-300 opacity-0 hover:opacity-100 h-full w-full overflow-y-auto'>
                  <h1 className='text-3xl font-semibold'>『{work.name}』</h1>
                  <p className='mt-2'>{work.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
