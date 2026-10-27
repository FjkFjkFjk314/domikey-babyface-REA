import React, { Fragment } from 'react'
import { blockCloud } from '../../../appConfig'

import { dj } from '../../../dj'
import { res } from '../../../res'
import { store } from '../../store'
import { Register } from './Register'

export const UserArgee = (p: { setAgree: (state: boolean) => void }) => (
  <Fragment>
    <dj.View w={370} h={530} x={415} y={118} form={'弹出框_domikey'} zIndex={2}>
      {/* <dj.Button
        w={12}
        h={12}
        x={36}
        y={26}
        img={{
          size: {
            w: 12,
            h: 12,
          },
          src: res.img.return,
        }}
        clickHandle={() => store.setState.user_UI(<Register />)} */}
      {/* /> */}
      <dj.Text h={35} y={12} text={res.string.法律条款} type={'弹框标题'} />
      <dj.TextArea
        form={'用户协议'}
        w={313}
        h={415}
        x={28}
        y={51}
        editble={false}
        // placeholder={res.text.用户同意协议()}
        placeholder={blockCloud ? 
          `Terms of Use
          These Terms of Use (or “Terms”) govern your use of Rongyuan as either a visitor or a content creator, except where we expressly state that separate terms (and not these) apply, and provide information about the Rongyuan Service (the “Service”), outlined below. When you create an Rongyuan account or visit the Rongyuan website, you comply agree to these terms. Please read the following terms and then use the Service. Any violation of the following terms or policies will limite your access to Rongyuan's website and service.
                  
          Any action of visiting or using the service of Rongyuan is deemed as the acceptance of this Terms of Use. If you do not agree with all the terms, please do not use or post any information to the Rongyuan website.
                  
          Updating These Terms
          Rongyuan may change and update the Service and policies, and we may need to make changes to these Terms so that they accurately reflect our Service and policies. Please check these terms regularly. 
                  
          User Data
          Providing our Service requires collecting and using your information like your name and email address. The Data Policy explains how we collect, use, and share information across the Rongyuan service. It also explains the many ways you can control your information, including in the Privacy and Security Settings. You must agree to the Data Policy to use Rongyuan service.
                  
          Any unauthorized account or ID is prohibited to use. One user account can only be used by one person and it should not be shared. 
                  
          Privacy Policy
          Rongyuan respects your privacy and will protect the personal information you provide us.
          
          There are certain security measures to prevent the loss, abuse and change of the information controlled by the tolerance circle.
          
          Although Rongyuan has taken the steps described in the privacy policy to ensure that your personal information will only be transmitted and disclosed in the manner described in the privacy policy, Rongyuan cannot guarantee that the personal information you provide will not be intercepted and cracked by others.
          
          content
          All text, graphics, user or visual interface, trademarks, logos, music, sounds, works of art, photos and computer code ("content") in the "website", including but not limited to design, structure, selection, coordination and expression, "appearance and feeling" and the arrangement of such "content", are owned by, controlled by and authorized by Rongyuan. All such contents are protected by commodity packaging, copyright, patent and trademark laws, as well as various other intellectual property rights and anti-unfair competition laws. Unless there are other applicable agreements for specific content (such as software license agreement, service terms, etc.), we only grant you limited rights to use the content, and you should perform the corresponding terms when using the content and only use such content for personal non-commercial information purposes.
          Unless expressly permitted by the applicable agreement or the content itself, no content may be reproduced, reproduced, distributed, reprinted, downloaded, displayed, posted or transmitted in any form or by any means (including but not limited to electronic, mechanical, photocopying, recording or other means) without the prior written consent of Rongyuan and/or the corresponding owner. In addition, without Rongyuan's prior written consent, you may not copy any content on this website or other servers by image means.
          Publish user content
          Specific areas of this website may allow you to publish content including experiences, opinions, suggestions, information, messages or other materials ("user content"). Please note that these areas are public and will not be kept confidential. You have the right to post user content in the public area and can only publish it in that area. You may not post any content that violates this clause or infringes the rights of any third party.
          Rongyuan has no ownership of any user content you publish. However, after you post user content in the public area of the website, you have granted Rongyuan, its affiliates, partners and distributors the right to use, copy, display, execute, distribute, modify, create derivative works, license others to use and promote user content free of charge, permanently and irrevocably, And the right to use and authorize others to use your name, portrait, personal profile, voice, video and photo (if applicable) for the purpose of connecting your posted content with yourself. In addition to user content, we also encourage you to provide feedback to us. You should agree that we can use all comments, suggestions, opinions, complaints and other feedback provided by you on this website, Rongyuan's products and/or services in any way and without any restriction, and that Rongyuan owns any intellectual property rights based on or adopted feedback.
          Illegal or prohibited use
          When using this website, the following behaviors are not allowed:
          Restrict or prohibit any other user from using this website and enjoying its services
          Post or transmit any illegal, fraudulent, defamatory, defamatory, racial discrimination, gender discrimination, obscenity, pornography, defamation of religious beliefs, threats, insults, insults or other insulting information of any kind
          Post or transmit any information that may constitute a crime, lead to civil liability, constitute unauthorized professional services, etc., or post or transmit any information that may induce others to commit such acts, or violate any local, provincial, domestic or foreign laws, including but not limited to U.S. export control laws and regulations
          Use "Logitech" or "Logi" name, domain name, trademark, logo or badge in your user name or network name, or in any other way that may imply that you cooperate with or belong to Rongyuan
          Counterfeit the identity of another person or its agent, or imitate any other person or entity
          Infringe privacy or violate any personal or exclusive rights of any person or entity
          Post or transmit any advertisements, solicitations, chain letters, pyramid or Ponzi schemes, investment opportunities or plans or other unsolicited commercial communications (unless explicitly agreed by Rongyuan), or participate in spam, phishing or denial of service attacks
          For commercial purposes, post, publish, transmit, reproduce, distribute or use in any way any information, software or other materials obtained from this website (except as expressly permitted by the provider of such information, software or other materials)
          Use this website to bring traffic to other websites
          Infringement of intellectual property or similar rights, including but not limited to the copyright, trademark and patent of any person or entity
          Upload, post, publish, transmit, reproduce or distribute information, software or other materials protected by copyright or other property rights obtained from this website in any form without the permission of the copyright owner or obligee, or create derivative works on such materials
          Upload, post, publish, reproduce, transmit or distribute any part of the website itself in any form or make any derivative creation on the part described herein without the written permission of Rongyuan (the website is protected by the United States and international copyright laws)
          Implement any operation that will cause unreasonable or disproportionate excessive load on the infrastructure of the website or the Rongyuan system or network, or any system or network connected to the website or Rongyuan
          Cover up the source of any message or transmission content you send to Rongyuan on or through the website or the services provided by the website by forging the title (header title) or tampering with the identifier
          Use any robot, spider program, screen capture program or other automatic means to access this website or service for any purpose without our express written permission; However, this provision does not apply to indexing or updating of search engines
          Post or transmit any information or software containing viruses, trojans, worms or other harmful content
          Post or transmit any information, files or software containing the following harmful software programs or program elements (but not limited to): viruses, trojans, worms, malicious ads, spyware, criminal software, online graffiti programs, embedded programs, rootkits, keyloggers, automatic programs, etc
          Links to third-party websites and services
          In order to provide you with more comprehensive and practical resources, this website may contain links to third-party websites, but these links are not within the control of Rongyuan. Rongyuan assumes no responsibility for the content or products in any linked website, or any linked content or products contained in the linked website, or for any changes or updates to such websites. Rongyuan only provides these links for the convenience of users. Adding these links does not mean that Rongyuan agrees with, guarantees or assumes any responsibility for the content or products on such third-party websites.
          
          When using this website, you may find that services, products, quotations and promotions provided by third parties are not provided by Rongyuan. If you decide to use the services or products of a third party, you shall be responsible for checking and understanding the relevant terms of any third party services or products. You agree that a third party, not Rongyuan, shall be responsible for the performance of the third party's services or products.
          No supervision responsibility
          Rongyuan has the right to supervise and/or delete the content provided by other parties in the website, but this is not our obligation. Although we will carry out relevant supervision on some communities and other areas, we have no obligation to pre-review any content, nor take any responsibility for the posting of such content. We reserve the right to refuse to post, edit and delete submitted content for any reason. At the same time, Rongyuan will not be responsible for any failure to delete the content or delay in the deletion operation.
          Complaint process of copyright infringement
          Rongyuan respects the intellectual property rights of others. If you think that your copyrighted works have been copied and can be accessed in the website and have constituted infringement, please contact us and inform us of such possible infringement. When contacting us, please provide the following information to Rongyuan's copyright agency:
          A complete description of the copyrighted works or other intellectual property rights that you think are infringed
          Electronic signature or actual signature provided by the authorized representative of the copyright or other intellectual property owner
          Description of the location of the specific content claimed to constitute infringement on the website
          Your name, address, phone number and e-mail address
          A statement provided by you indicating that you are convinced that the disputed use has not been authorized by the copyright owner, its agency or relevant laws
          A statement signed by you, which should verify the accuracy of the information in the above notice under the perjury clause, and indicate that you are the copyright or intellectual property owner, or have been authorized to represent the copyright or intellectual property owner
          Disclaimers
          Unless otherwise specified, to the maximum extent permitted by law, the website itself and all data, information, records, opinions or services contained in or linked to the website are provided on the principle of "as is" and "available", without any kind of guarantee, and the supplier Third-party service providers and partners (hereinafter collectively referred to as "suppliers") hereby expressly refuse to provide any form of express or implied warranty, including but not limited to implied warranty of merchantability, warranty of fitness for a particular purpose, warranty of non-infringement and warranty of interest. Rongyuan has no objection or approval to the accuracy, timeliness or reliability of any suggestions, opinions, statements or other information displayed, uploaded or disseminated through this website. Rongyuan and its suppliers do not guarantee that this website will meet your requirements and expectations; The access to the website itself or any information, records, opinions or services linked to it will not be interrupted, timely, safe and error-free; The results obtained by such use behavior are accurate or reliable, or can meet your needs. Rongyuan cannot guarantee that any file or other data you download from this website is free of viruses, malware, trojans, worms, malicious ads, spyware, criminal software, online graffiti programs, embedded programs, rootkits, keyboard loggers, automatic programs or other harmful software programs or program parts. In addition, Rongyuan assumes no responsibility for any third-party service provider or partner (whether entity or network). Any oral or written information received or obtained by Rongyuan and its suppliers will not affect this disclaimer. Some laws do not allow such restrictions. At this time, the above restrictions may not apply in your jurisdiction.
          Limited liability
          You clearly understand and agree that Rongyuan (or Rongyuan's employees, directors, investors, subsidiaries, agents, trustees, representatives, suppliers, partners or employees) will not be liable for any direct damage or any special, direct, indirect, incidental, concurrent or punitive damage, including but not limited to the loss of use, data loss Any damage caused by loss of profits or other intangible losses (even if Rongyuan has known the possibility of such damage), including the use or inability to use this website, the deletion or termination of this website, unauthorized access to or modification of the content or data you transmit, the error or omission of the content of this website, the statement or behavior of any third party in this website, the description provided or linked by this website Information or services or any other matters related to this website. For any and all complaints related to the use of this website, the cumulative liability of Rongyuan and its suppliers shall not exceed the total amount (if any) of the fees you paid to Rongyuan for this particular service in the previous year or US $100.00 (whichever is the smaller). In some jurisdictions, such as New Jersey, the above restrictions are not allowed. Therefore, the above restrictions do not apply to New Jersey, and may not apply to your jurisdiction.
          compensate for
          You shall indemnify, defend and hold Rongyuan harmless from any and all claims, demands, costs and liabilities (including reasonable attorneys' fees) of any third party arising from your actions or omissions in violation of the relevant provisions and misuse of this website (including Rongyuan's subsidiaries and their employees, employees and agents). Rongyuan reserves the right to independently defend and control any matter for which you need compensation; And you agree to give full cooperation within the reasonable limit required to defend any claim. The foregoing indemnity clause shall not apply to any claim, demand, loss, cost or liability arising from Rongyuan's own negligence, fraud, intentional injury or intentional violation of law.
          Disclosure of use information
          When Rongyuan determines that it is necessary and necessary for the following purposes, it can disclose any information we have about you (including your identity), any transmission or communication you have made, and your use of this website or any services you receive on this website: (1) perform legal procedures; (2) Perform any investigation or complaint about your use of this website; (3) Implement the terms of use described herein; (4) Respond to complaints of infringement of the rights of others; (5) Protect Rongyuan's rights, property or personal safety of Rongyuan's employees, visitors and users of this website, as well as Rongyuan's customers and the public.
          Rongyuan reserves the right to disclose any information at any time when we think it is necessary to perform applicable laws, regulations, legal procedures or administrative orders. Rongyuan can also disclose your information when we think it is required or permitted by applicable laws, including exchanging information with other companies and organizations for the purpose of preventing fraud.
          
          termination
          You agree that Rongyuan has violated these Terms of Use or other agreements or regulations related to your use of this website, or for the purpose of including but not limited to (1) requirements of law enforcement or other government agencies; (2) You requested to delete your account; (3) The website stops service or content adjustment, or any service provided in or through the website stops implementation or content adjustment; (4) For unexpected technical problems or failures, we have the sole discretion to terminate your access to this website and/or block your access to this website in the future without prior notice.
          In the event of termination of this Agreement, the restrictions, representations and warranties, indemnities and limits of liability of the content or materials appearing on this website specified in the Terms of Use will continue to be valid. If you are not satisfied with this website or the service provided by Rongyuan, your only remedy is to terminate this agreement.
          If Rongyuan takes any legal measures against you when you violate these Terms of Use, Rongyuan shall have the right to claim compensation from you, and you agree to pay all reasonable attorney fees and the cost of taking such measures in addition to any mandatory or balanced compensation obtained by Rongyuan according to the judgment. You agree that Rongyuan shall not bear any responsibility to you or any third party for terminating your visit to this website.
          
          Applicable law
          Whether it conflicts with the legal terms or not, the terms of use and your use of this website shall be governed by the laws of the United States and the laws of California; All complaints and legal actions must be transferred to the corresponding state court or federal court located in Santa Clara, California, United States; And you agree to use the personal jurisdiction of the court mentioned here in any such complaint or action. You voluntarily waive all defenses for lack of personal jurisdiction and venue.
          
          other
          Rongyuan can transfer these terms of use to any subsidiary or any subsidiary at any time, or to other entities as part of the sale, merger or other transfer activities carried out by Rongyuan. You may not assign this agreement. These Terms of Use constitute the entire agreement between you and Rongyuan on this subject, and are applicable to all your use of this website. Rongyuan's failure to exercise or enforce any right or clause in this clause does not mean that it waives such right or clause. If any provision of these Terms of Use is found to be invalid, both parties still agree that this provision reflects the wishes of both parties and that other provisions of these Terms of Use remain in full force and effect. No matter whether it conflicts with any statute or law (except New Jersey), any complaint or prosecution related to or arising from the use of this website or these terms must be filed within one (1) year after the occurrence of such complaint or prosecution reason, otherwise it will be permanently prohibited.
          
          The ownership and operation right of this website belongs to Rongyuan.
          
          Rongyuan revised these terms in August 2020.
          `:
          `
使用条款
本使用条款（"条款"）是您与容圆之间的法律协议，管理您作为访客、内容贡献者或注册用户使用本网站的行为。使用或访问本网站以及在其中发布信息时，都应遵行上述条款，因此请先仔细阅读这些条款，然后再使用本网站。若您违反本网站发布的条款或政策，包括本文中的这些条款，或因任何理由、在任何时候有违反相关规定的情况，容圆保留限制或终止您访问本网站的权利，或终止或暂停您注册的权利。

以任何形式访问和使用本网站或软件都视为同意受本条款约束。如果不完全同意所有条款，请勿通过任何方式使用本网站或在其中张贴任何信息。

条款的修订
容圆可随时更改、修订、更新、添加或删除这些条款中的任一部分。请定期检查这些条款是否有变更。在更改已发布后，如您继续使用本网站，即表明您已接受这些更改。

网站的更改
为了持续改善本网站并提高其实用性，我们可能会增设其他服务或对现有服务做出调整。如果容圆进行了此类更改，则本条款仍适用于新的服务或者对现有服务所做的任何修改。

用户信息
要使用本网站的特定区域时，将会要求您提供个人信息，例如姓名、电子邮件地址、密码、城市、省份、邮政编码等。帐户信息（包括密码在内）的保密以及在您帐户之下发生的任何和全部活动，都完全由您本人负责。您同意，在帐户或密码受到未经授权的使用或者出现其他安全问题时，立即通知容圆。对于因其他人使用您的容圆 ID、密码或帐户而给容圆或网站任何其他用户或者网站访客造成的损失，需由您承担责任。

无论何时，如未获得容圆 ID、密码或帐户所有人的明确许可和同意，您都不可使用此类容圆 ID、密码或帐户。 容圆用户帐户和密码仅供个人使用，请勿分享。 禁止多人共享或通用帐户。 对于因您未履行上述义务而造成的任何损失或损害，容圆不能并且也不会承担任何责任。


隐私政策
容圆尊重您的隐私权，并会保护您向我们提供的个人信息。

容圆有一定的安全措施，以防止容圆控制的信息丢失、滥用和更改。

尽管容圆已采取隐私政策中所述的各项步骤来确保您的个人信息仅会按隐私政策所述方式进行传送和披露，但容圆不能保证您所提供的个人信息不被其他人截获并破解。

内容
"网站"中所有文本、图形、用户或视觉界面、商标、徽标、音乐、声音、艺术作品、照片和计算机代码（"内容"），包括但不限于设计、结构、选择、协调和表述、"外观和感觉"和对此类"内容"的排列方式，均归容圆所有、受容圆控制并由容圆提供授权。所有此类内容均受商品包装、版权、专利和商标法以及各种其他知识产权和反不正当竞争法律保护。除非就特定的内容有其他适用协议（例如，软件许可证协议、服务条款等），否则我们仅授予您有限的权利来使用内容，而且您在使用时应履行相应条款并仅将此类内容用作个人的非商业信息用途。

除非适用协议或内容本身明确准许，否则在未事先获得容圆和/或相应所有者的书面同意前，任何内容均不可以通过任何形式或任何手段（包括但不限于电子、机械、影印、录音或其他方式）进行复制、再现、分发、再版、下载、显示、张贴或传送。另外，在未经容圆事先书面同意的情况下，您也不得通过镜像手段复制本网站或其他服务器中的任何内容。

发表用户内容
本网站的特定区域可能会允许您发布包括体验、意见、建议、信息、消息或其他资料在内的内容（"用户内容"）。请注意，这些区域为公开区域，并不会予以保密。您有权在公开区域张贴用户内容，并也仅可在该区域进行发布。您不可张贴任何违反本条款或侵犯任何第三方权利的内容。

对于您所发布的任何用户内容，容圆都没有所有权。但是，您在网站的公开区域张贴用户内容后，您便免费、永久且不可撤回地授予了容圆、容圆的附属机构、合作伙伴和分销商通过任何介质并以任何方式使用、复制、显示、执行、分发、修改、创建衍生作品、许可他人使用和宣传用户内容的权限，以及出于将您张贴的内容与您本人联系起来的目的使用和授权他人使用您的姓名、肖像、个人简介、声音、视频和照片（如适用）的权限。除了用户内容外，我们也鼓励您向我们提供反馈。您应同意我们以任何方式且无任何限制地使用您提供的关于本网站、容圆的产品和/或服务的所有评论、建议、意见、投诉和其他反馈，而且同意容圆拥有在根据或采用反馈基础上形成的任何知识产权。

非法用途或明令禁止的用途
在使用本网站时，不可进行以下行为：

限制或禁止任何其他用户使用本网站和享受本网站服务
张贴或传送任何非法、欺诈、诽谤、中伤、种族歧视、性别歧视、淫秽、色情、诋毁宗教信仰、威胁、辱骂、侮辱或其他任何类型的侮辱性信息
张贴或传送任何本身即可构成犯罪、导致民事责任、构成未授权专业服务等行为的信息，或者张贴或传送任何可诱使他人构成此类行为的信息，或违反任何地方、省、国内或国外法律，包括但不限于美国出口控制法律法规
在您的用户名或网名中使用，或者以任何其他可暗示您与容圆合作或附属于容圆的方式使用"Logitech"或"Logi"名称、域名、商标、徽标或徽章
 假冒其他人或其代理人的身份，或者模仿任何其他人或实体
侵犯隐私或违反任何个人或实体的任何个人权利或专有权利
张贴或传送任何广告、教唆、连锁信、金字塔或旁氏骗局、投资机会或计划或者其他未经请求而主动提供的商业通信（除非由容圆明确同意），或者参与垃圾邮件、网络钓鱼或拒绝服务攻击
出于商业目的，张贴、发布、传送、再现、分发或以任何方式利用任何从本网站中获取的信息、软件或其他资料（由此类信息、软件或其他资料的提供人明确准许的情况除外）
使用本网站为其他网站带来流量
侵犯知识产权或类似权利，包括但不限于任何个人或实体的版权、商标和专利
在未获得版权所有人或权利人允许的情况下，以任何形式上传、张贴、发布、传送、再现或分发从本网站中获取的受版权或其他产权保护的信息、软件或其他材料，或者就此类材料进行衍生创作
在未经容圆书面允许情况下，以任何形式上传、张贴、发布、再现、传送或分发本网站本身的任何组成部分或者就此处所述部分进行任何衍生创作（本网站受美国和国际版权法保护）
实施任何会对本网站的基础架构或容圆系统或网络，或连接至本网站或容圆的任何系统或网络造成不合理或不相称的过大负载的操作
以伪造标题（抬头标题）或篡改标识符的方式，掩饰您在本网站上或通过本网站、本网站所提供的服务而发送给容圆的任何消息或传输内容的来源
在未经我们明确书面准许情况下，出于任何目的地使用任何机器人、蜘蛛程序、抓屏程序或其他自动方式访问本网站或服务；但本规定不适用于搜索引擎的索引或更新
张贴或传送任何包含病毒、木马、蠕虫或其他有害内容的信息或软件
张贴或传送任何包含以下有害软件程序或程序元素（但不限于此）的信息、文件或软件：病毒、木马、蠕虫、恶意广告、间谍软件、犯罪软件、在线涂鸦程序、植入程序、rootkit、键盘记录器、自动程序等
指向第三方网站和服务的链接
为了向您提供更为全面和实用的资源，本网站可能会包含指向第三方网站的链接，但这些链接不在容圆的控制范围之内。对于任何链接网站中的内容或产品，或者链接网站所含的任何链接的内容或产品，或者对于此类站点的任何更改或更新，容圆均不承担任何责任。容圆仅是出于方便用户而提供这些链接，添加这些链接并不表明容圆赞同此类第三方网站上的内容或产品、为其提供担保或者对其承担任何责任。

在使用本网站时，可能会发现由第三方提供的服务、产品、报价和促销，这些并不由容圆所提供。如果您决定使用第三方的服务或产品，您应自行负责检查和理解任何第三方服务或产品的相关条款。您同意应由第三方而非容圆对第三方服务或产品的性能承担责任。

无监督责任
容圆有权利监督和/或删除网站中由其他方面提供的内容，但这不是我们必须履行的义务。尽管我们会对部分社区和其他区域进行相关性监督，但我们没有义务对任何内容进行预审，也不对此类内容的张贴承担任何责任。我们保留出于任何原因而拒绝张贴、编辑已提交的内容和删除内容的权利。同时，容圆对于任何未能删除内容或删除操作的延迟不承担任何责任。

版权侵犯投诉流程
容圆尊重他人的知识产权。如果您认为网站中已复制且可访问到您的版权作品，并已构成侵权，请与我们取得联系并告知我们此类可能存在的侵权情况。在与我们联系时，请向容圆的版权机构提供以下信息：

针对您认为被侵权的版权作品或其他知识产权的完整描述
版权或其他知识产权所有人的授权代表提供的电子签名或实际签名
对于声称构成侵权的具体内容在网站上所处位置的描述
您的姓名、地址、电话号码和电子邮件地址
由您提供的一份陈述，指出您确信所争议的使用行为未获得版权所有者、其代理机构或相关法律的授权
由您签字的一份陈述，其中应在伪证罪条款之下证实上述通知中信息准确，并指出您是版权或知识产权所有人，或者已获授权来代表版权或知识产权所有人


免责声明
除非另行明确规定，否则在法律允许的最大限度内，网站本身及网站中包含的或链接的所有资料、信息、记录、意见或服务均以"按原样"和"可得到"的原则提供，没有任何类型的担保，并且容圆及容圆的供应商、第三方服务提供商和合作伙伴（下文统称为"供应商"）特此明确拒绝提供任何形式的明示或默示担保，其中包括但不限于默示适销性担保、适合特定用途担保、无侵权担保和利益担保。对于通过此网站显示、上传或传播的任何建议、看法、声明或其他信息的准确性、及时性或可靠性，容圆不提出异议或认可。容圆及其供应商不担保：本网站会符合您的要求和期待；对于网站本身或其中链接的任何信息、记录、意见或服务的访问不会被中断、及时、安全且无任何错误；通过此类使用行为所得到的结果准确或可靠，或者可满足您的需求。容圆不能保证您从本网站下载的任何文件或其他数据没有各种病毒、恶意软件、木马、蠕虫、恶意广告、间谍软件、犯罪软件、在线涂鸦程序、植入程序、rootkit、键盘记录器、自动程序或其他有害软件程序或程序部分。此外，容圆对任何第三方服务供应商或合作伙伴（无论实体还是网络）都不承担任何责任。容圆及其供应商所收到或获得的任何口头或书面信息都不会对本免责声明造成影响。某些法律不允许设置此类限制，此时上述限制可能在您所在的司法管辖区并不适用。

有限责任
您明确理解并同意，容圆（或容圆的职员、主管、投资人、子公司、代理机构、受托人、代表、供应商、合作伙伴或员工）对于任何直接损害或任何特殊、直接、间接、偶然性、并发性或惩罚性损害均不承担任何责任，此类损害包括但不限于由不能使用、数据丢失、利润损失或其他无形损失造成的任何损害（即使容圆已了解存在发生此类损害的可能性），造成损害的原因包括使用或无法使用本网站、本网站的删除或终止、未授权访问或修改您传送的内容或数据、本网站内容的错误或遗漏、任何第三方在本网站中的陈述或行为、本网站提供的或链接的说明、信息或服务或者任何其他与本网站相关的事宜。对于与使用本网站相关的任何和所有投诉，容圆及其供应商所承担的累计责任始终不应超过您在上一年中针对该特定服务而向容圆支付的费用总金额（如有）或 100.00 美元（取二者之间的较小值）。在某些司法管辖区，例如新泽西，不允许存在上述限制，因此上述限制对新泽西不适用，因此也可能对您所在司法管辖区不适用。

赔偿
由您违反相关条款、错误使用本网站时的作为或疏忽而造成的第三方的任何和所有索赔、要求、成本和责任（包括合理的律师费），您都应对容圆进行赔偿、为容圆辩护并使容圆免受损失（包括容圆的分公司及其职员、员工和代理人）。对于您需要赔偿的任何事宜，容圆保留独立辩护和控制的权利；并且您同意在对任何索赔进行辩护所需的合理限度内给予充分配合。前述赔偿条款不适用于因容圆自身疏忽、欺诈、故意伤害或故意违反法律等原因导致的任何索赔、要求、损失、成本或责任。

使用信息的披露
在容圆判定出于以下目的并且确有必要时，可披露我们拥有的关于您的任何信息（包括您的身份）、您所进行的任何传送或通信以及您对本网站的使用情况或在本网站中接受的任何服务：(1) 履行法律程序；(2) 履行任何有关您对本网站使用情况的调查或投诉；(3) 执行此处所述的使用条款；(4) 在有人提出侵犯他人权利的投诉时进行响应；(5) 保护容圆的权利、财产或容圆的员工、本网站的访客和用户以及容圆的客户和公众的人身安全。

容圆保留在我们认为履行适用法律、法规、法定程序或行政指令时根据需要随时披露任何信息的权利。容圆还可在我们认为适用法律要求或允许时披露您的信息，其中包括出于防止欺诈目的而与其他公司和组织交换信息。

终止
您同意容圆在确定您已违反本使用条款或其他与您使用本网站相关的协议或规定时，或者出于包括但不限于 (1) 执法或其他政府机构要求；(2) 由您请求删除您的帐户；(3) 本网站停止服务或内容调整，或者在本网站中提供或通过本网站提供的任何服务停止施行或进行内容调整；(4) 意外发生的技术问题或故障等原因，在无事先通知的情况下由我们全权决定终止您对本网站的访问并且/或者阻止您在未来对本网站的访问。

若本协议终止，本使用条款中规定的出现在本网站的内容或资料的限制、代表和保证、赔偿和责任范围将继续有效。若您对本网站或由容圆提供的服务不满意，您的唯一补救办法是终止本协议。

如果容圆在您违反本使用条款时对您采取任何法律措施，容圆应有权向您索取补偿，并且您同意在容圆根据判决获得的任何强制性或平衡性补偿之外另行支付所有合理的律师费用及采取此类措施的成本。您同意，容圆不应为终止您访问本网站而对您或任何第三方担负任何责任。

适用法律
无论与法律条款冲突与否，本使用条款和您对本网站的使用行为都应受美国法律和加利福尼亚州法律管辖；所有投诉和法律行动都必须转至位于美国加利福尼亚州圣克拉拉的相应州法庭或联邦法庭执行；并且您同意在对任何此类投诉或行动进行诉讼时都采用此处所述法庭的属人管辖权。您主动放弃对缺少属人管辖权和审判地点的所有辩护。

其他
容圆可随时将本使用条款转让给任何子公司或任何附属公司，或者作为由容圆进行的出售、并购或其他转让活动的一部分转让给其他实体。您不可转让此协议。本使用条款构成您和容圆之间有关此主题的全部协议，并且本条款适用于您使用本网站的所有行为。容圆未能行使或执行本条款中的任何权利或条款并不意味着放弃此类权利或条款。如果发现本使用条款的任何规定无效，双方仍然同意本规定反映双方意愿并且本使用条款的其他规定仍保持全部效力。无论是否与任何法令或法律相冲突（新泽西除外），与使用本网站或本条款相关的或由此造成的任何投诉或起诉都必须在此类投诉或起诉理由产生后的一 (1) 年内提出，否则将永远禁止提出。

本网站的所有权和运营权归属于容圆。
容圆于 2020 年 8 月修订这些条款。
          `
        }
      />
      <dj.Button
        w={106}
        h={27}
        x={135}
        y={485}
        mode={'宏按键'}
        text={res.string.同意}
        clickHandle={() => {
          p.setAgree(true)
          store.setState.user_UI(<Register />)
        }}
      />
    </dj.View>
  </Fragment>
)
