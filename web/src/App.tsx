import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { createGist, listGists, loginProcedure } from "./axios";
import { GhCreateGistResp, GhUserResp } from "./types/github";
import { Avatar, Form, Space, Input, Button, message, Result } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { LunarBirthdayData } from "./types/birthdays";
import copy from "copy-to-clipboard";

const datereg = /^\d\d\d\d\.\d\d\.\d\d$/;

function App() {
  const [userInfo, setUserInfo] = useState<GhUserResp | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createInfo, setCreateInfo] = useState<GhCreateGistResp | null>(null);

  const hasLogin = useMemo(() => Boolean(userInfo), [userInfo]);

  useEffect(() => {
    const initLogin = async () => {
      setLoading(true);

      const userinfo = await loginProcedure();
      if (userinfo) {
        setUserInfo(userinfo);
      }

      setLoading(false);
    };

    initLogin();
  }, []);

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    const afterLogin = async () => {
      const gists = await listGists();
      console.log({ gists });
    };

    afterLogin();
  }, [userInfo]);

  const onFinish = async (values: { birthdays: LunarBirthdayData[] }) => {
    const output = window.generateIcsContent(
      JSON.stringify({
        bds: values.birthdays.map((val) => {
          const regmap = datereg.exec(val.date)!;

          return {
            yy: Number(regmap[1]),
            mm: Number(regmap[2]),
            dd: Number(regmap[3]),
            name: val.name,
          };
        }),
        remindAt: 12,
      })
    );

    console.log({ output });
    setUploading(true);
    setCreateInfo(null);
    try {
      const createResp = await createGist({
        content: output,
        filename: "calsubs.ics",
        description: "add lunar birthday reminders to your calendar apps",
      });
      setCreateInfo(createResp.data);
    } catch (error) {}
    setUploading(false);
  };

  const LoginEntry = useMemo(() => {
    return (
      <div className="login">
        <a
          href={`https://github.com/login/oauth/authorize?scope=gist&client_id=6d2d4cc612c4efd78294&state=abcdefg&redirect_uri=${decodeURIComponent(
            "http://localhost:5173"
          )}`}
        >
          Login with Github
        </a>
      </div>
    );
  }, []);

  const OperationEntry = (
    <div className="operation">
      <Form
        name="lunarBirthdays"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
        autoComplete="off"
        initialValues={{
          birthdays: [
            {
              date: "1996.12.22",
              name: "🎂父亲的农历生日🎂",
            },
          ],
        }}
      >
        <Form.List name="birthdays">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "date"]}
                    rules={[
                      { required: true, message: "填入农历日期" },
                      {
                        pattern: datereg,
                        message: "请输入正确的日期格式",
                      },
                    ]}
                  >
                    <Input placeholder="农历日期，如1996.12.20" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "填入备注" }]}
                  >
                    <Input placeholder="生日备注" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加生日
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const SubsLink = () => {
    const link = createInfo?.files["calsubs.ics"].raw_url;
    return (
      <Space
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 8,
        }}
        align="baseline"
      >
        <div>日历订阅链接</div>
        {link && (
          <Button type="text" onClick={() => copy(link)}>
            {link}
          </Button>
        )}
      </Space>
    );
  };

  return (
    <main className="app">
      {userInfo && (
        <header className="header">
          <Avatar src={userInfo.avatar_url} alt="GitHub User" />
        </header>
      )}
      {!hasLogin ? LoginEntry : OperationEntry}
      {createInfo && <SubsLink />}
    </main>
  );
}

export default App;
