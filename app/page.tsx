import Image from 'next/image'

export default function Home() {
  const dekirukotos = ["ウェブアプリ", "デザイン", "作字"]
  const SNSs = [
    { icon: "twitter", link: "https://twitter.com/4mpoi" },
    { icon: "github", link: "https://github.com/Ampoi" }
  ]
  const creations = [
    { image: "./creations/Stask.jpeg", name: "Stask", description: "2022年夏〜学力向上アプリコンテスト〜未踏ジュニアにかけて開発している学生向けの課題管理アプリです。使いやすい(使いやすくする)から使ってみてね。" },
    { image: "./creations/ToBe.png", name: "ToBe", description: "ゲームのスキルツリーみたいな感じで自分のタスクできたら面白そうだな〜　って思って作ったアプリです。" },
    { image: "./creations/URLMEMO.png", name: "URLMEMO", description: "URLを通じてメモを保存・閲覧・共有できるアプリです。Instagramとかでそのまま文見られるよりはひと段落あったほうがいいかなって思って作りました。" },
    { image: "./creations/KAGARIBI.png", name: "131代海城祭公式サイト", description: "131代の文化祭公式サイトです。" },
    { image: "./creations/BASER.png", name: "BASER", description: "2Dの火星みたいな星の上で色々するゲームです。気が向いたらたまに開発してます。" },
  ]
  const works = [
    { image: "./works/AKEOME.jpg", name: "あけおめ", description: "2023年度元旦のやつです。" },
    { image: "./works/ATTITUDE.jpg", name: "Attitude", description: "Mrs.GREEN APPLEの「Attitude」の作字です。" },
    { image: "./works/DORYOKU.jpeg", name: "努力", description: "KICK BACKの替え歌みたいなのでめっちゃ努力って入ってるやつがあったので作ってみました。特に意味はないです。" },
    { image: "./works/GENDOUKI.jpg", name: "原動機", description: "昭和感出したくて作ってみました。" },
    { image: "./works/KAIJUNOHANAUTA.jpg", name: "怪獣の花唄", description: "5月くらいまで獣って字の左側に線が入ってるってこと知りませんでした。漢字間違ってます。" },
    { image: "./works/LOVIN.jpg", name: "lovin'", description: "Mrs.GREEN APPLEの「lovin'」の作字です。歌がめっちゃ可愛いので聞いてみてください。" },
    { image: "./works/MITIBIKI.jpeg", name: "導", description: "方べきの定理に見えるとあまり評価は良くなかったです。" },
    { image: "./works/ROUDOU.jpg", name: "働", description: "友達とやっていたマイクラの労働サーバーのアイコンです。" },
    { image: "./works/SEITOKAI.jpeg", name: "生徒会", description: "とりあえず作ってみただけです。特に生徒会への忠誠心とかはありません。" },
    { image: "./works/TUKIMASITEHA.jpg", name: "ツキマシテハ", description: "Mrs.GREEN APPLEの「ツキマシテハ」の作字です。本当にいい曲なので聞いてみてください。" },
  ]

  return (
    <main>
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
        <h2 className='text-6xl font-bold text-black/10'>Creations</h2>
        <p className='-mt-6 ml-4'>これまでに作った作品とかです。</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
          {creations.map((creation) => {
            return (
              <div
                className='bg-slate-300 rounded-lg relative bg-cover bg-center overflow-hidden'
                style={{
                  aspectRatio: "16/ 9",
                  backgroundImage: `url(${creation.image})`
                }}>
                <div className='absolute px-4 py-8 bg-white/80 backdrop-blur-sm transition duration-300 opacity-0 hover:opacity-100 h-full w-full overflow-y-auto'>
                  <h1 className='text-3xl font-semibold'>{creation.name}</h1>
                  <p className='mt-2'>{creation.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='max-w-3xl mx-auto px-4 mt-10'>
        <h2 className='text-6xl font-bold text-black/10'>Works</h2>
        <p className='-mt-6 ml-4'>これまでに作った作字とかです。たまにTwitterとかで投稿しています。</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
          {works.map((work) => {
            return (
              <div
                className='bg-slate-300 rounded-lg relative bg-cover bg-center overflow-hidden'
                style={{
                  aspectRatio: "1 / 1",
                  backgroundImage: `url(${work.image})`
                }}>
                <div className='absolute px-4 py-8 bg-white/40 backdrop-blur-xl transition duration-300 opacity-0 hover:opacity-100 h-full w-full overflow-y-auto'>
                  <h1 className='text-3xl font-semibold'>{work.name}</h1>
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
